import { getApiKey, getToken, getUser } from './utils/storage.js';
import type { Post, Profile, ProfileSummary } from './types/social.js';

interface User {
  name: string | null;
  email: string | null;
  accessToken: string | null;
  username?: string;
  avatar?: string;
}

const API_URL = 'https://v2.api.noroff.dev';

// Returns headers for authenticated API requests
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${getToken() || ''}`,
    'X-Noroff-API-Key': getApiKey() || '',
  };
}

// Fetches posts for a list of profiles
async function getPostsForProfiles(
  profiles: ProfileSummary[]
): Promise<Post[]> {
  const postsByProfile = await Promise.all(
    profiles.map(async (profile) => {
      const response = await fetch(
        `${API_URL}/social/profiles/${encodeURIComponent(profile.name)}/posts`,
        { headers: getHeaders() }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return (data.data || []).map((post: Post) => ({
        ...post,
        profileName: profile.name,
      }));
    })
  );

  return postsByProfile.reduce(
    (allPosts: Post[], profilePosts: Post[]) => allPosts.concat(profilePosts),
    []
  );
}

// Renders posts inside the profile page
function renderProfilePosts(
  postsContainer: Element,
  posts: Post[],
  emptyMessage: string
): void {
  if (posts.length === 0) {
    postsContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  postsContainer.innerHTML = posts
    .map((post: Post) => {
      const date = post.created
        ? new Date(post.created).toLocaleDateString()
        : '';
      return `
      <article class="post-card">
        <div class="post-card-header">
          <span class="post-author">${post.profileName || ''}</span>
          <span class="post-date">${date}</span>
        </div>
        ${post.media?.url ? `<img src="${post.media.url}" class="post-image" alt="">` : ''}
        <p>${post.body || ''}</p>
        <div class="post-tags">
          ${(post.tags || [])
            .map(
              (tag) =>
                `<span class="tag">${typeof tag === 'string' ? tag : tag.name}</span>`
            )
            .join('')}
        </div>
      </article>
    `;
    })
    .join('');
}

// Initializes the profile page
export async function initProfile(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const user = getUser() as User;
  if (!user) return;

  const profileName = new URLSearchParams(window.location.search).get('name');
  const username = profileName || user.username;

  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsed = JSON.parse(storedUser);

    if (!parsed.username && parsed.name) {
      parsed.username = parsed.name;
    }

    user.username = parsed.username;
    user.avatar = parsed.avatar || user.avatar;
    localStorage.setItem('user', JSON.stringify(user));
  }

  const nameEl = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');
  const logoutBtn = document.querySelector('.btn-logout');
  const postsContainer = document.querySelector('.profile-posts');
  const avatarEl = document.querySelector(
    '.profile-avatar'
  ) as HTMLImageElement;
  const avatarInput = document.getElementById('avatarUrl') as HTMLInputElement;
  const saveAvatarBtn = document.querySelector(
    '.btn-save-avatar'
  ) as HTMLButtonElement;
  const avatarEditBtn = document.querySelector('.avatar-edit-btn');
  avatarEditBtn?.addEventListener('click', () => {
    avatarInput?.classList.toggle('hidden');
    saveAvatarBtn?.classList.toggle('hidden');
  });
  const followBtn = document.querySelector('.follow-btn') as HTMLButtonElement;
  const tabs =
    document.querySelectorAll<HTMLButtonElement>('.profile-tabs .tab');
  const postsTab = document.querySelector('.profile-tabs [data-tab="posts"]');

  if (!username) return;

  if (postsTab) postsTab.textContent = profileName ? 'Posts' : 'My posts';

  if (!profileName) {
    if (nameEl) nameEl.textContent = user.name || '';
    if (emailEl) emailEl.textContent = user.email || '';
    if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    if (avatarInput && user.avatar) avatarInput.value = user.avatar;
  } else {
    document.querySelector('.profile-actions')?.classList.add('hidden');
    document
      .querySelector('.profile-avatar-wrapper input')
      ?.classList.add('hidden');
    document.querySelector('.btn-save-avatar')?.classList.add('hidden');
  }

  if (saveAvatarBtn && avatarInput && avatarEl) {
    saveAvatarBtn.addEventListener('click', async () => {
      const url = avatarInput.value.trim();
      if (!url || !user.username) return;
      saveAvatarBtn.disabled = true;

      try {
        const response = await fetch(
          `${API_URL}/social/profiles/${encodeURIComponent(user.username)}`,
          {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ avatar: { url, alt: 'Profile picture' } }),
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.errors?.[0]?.message || 'Could not update profile picture'
          );
        }

        const updatedAvatar = data.data?.avatar?.url || url;
        user.avatar = updatedAvatar;
        localStorage.setItem('user', JSON.stringify(user));
        avatarEl.src = updatedAvatar;
        avatarInput.classList.add('hidden');
        saveAvatarBtn.classList.add('hidden');
      } catch (error) {
        console.error('Could not save profile picture:', error);
      } finally {
        saveAvatarBtn.disabled = false;
      }
    });
  }

  logoutBtn?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  const profileResponse = await fetch(
    `${API_URL}/social/profiles/${encodeURIComponent(username)}?_followers=true&_following=true`,
    { headers: getHeaders() }
  );
  const profileData = await profileResponse.json();
  if (!profileResponse.ok) return;

  const profile = profileData.data as Profile;
  const profileAvatar =
    profile.avatar && typeof profile.avatar !== 'string'
      ? profile.avatar.url
      : undefined;

  if (nameEl) nameEl.textContent = profile.name || username;
  if (emailEl) emailEl.textContent = profile.email || '';
  if (profileAvatar) {
    user.avatar = profileAvatar;
    localStorage.setItem('user', JSON.stringify(user));
    if (avatarEl) avatarEl.src = profileAvatar;
    if (avatarInput) avatarInput.value = profileAvatar;
  }

  if (profileName && followBtn) {
    const isFollowing = (profile.followers || []).some(
      (follower: ProfileSummary) => follower.name === user.name
    );
    followBtn.classList.remove('hidden');
    followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
    followBtn.dataset.following = String(isFollowing);
    followBtn.addEventListener('click', async () => {
      const following = followBtn.dataset.following === 'true';
      followBtn.disabled = true;

      try {
        const action = following ? 'unfollow' : 'follow';
        const response = await fetch(
          `${API_URL}/social/profiles/${encodeURIComponent(username)}/${action}`,
          { method: 'PUT', headers: getHeaders() }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.message || `Could not ${action}`);
        }
        const nowFollowing = !following;
        followBtn.dataset.following = String(nowFollowing);
        followBtn.textContent = nowFollowing ? 'Unfollow' : 'Follow';
      } catch (error) {
        console.error('Could not update follow status:', error);
      } finally {
        followBtn.disabled = false;
      }
    });
  }

  const ownPostsResponse = await fetch(
    `${API_URL}/social/profiles/${encodeURIComponent(username)}/posts`,
    { headers: getHeaders() }
  );
  const ownPostsData = await ownPostsResponse.json();
  const ownPosts = (ownPostsData.data || []) as Post[];
  if (postsContainer)
    renderProfilePosts(postsContainer, ownPosts, 'No posts yet.');

  tabs.forEach((tab) => {
    tab.addEventListener('click', async () => {
      tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      const tabType = tab.dataset.tab;

      if (!tabType || tabType === 'posts') {
        renderProfilePosts(postsContainer!, ownPosts, 'No posts yet.');
        return;
      }

      const profiles: ProfileSummary[] =
        tabType === 'followers'
          ? profile.followers || []
          : profile.following || [];
      if (profiles.length === 0) {
        renderProfilePosts(
          postsContainer!,
          [],
          tabType === 'followers'
            ? 'No followers yet.'
            : 'Not following anyone yet.'
        );
        return;
      }

      postsContainer!.innerHTML =
        '<p class="loading-message">Loading posts...</p>';
      const posts = await getPostsForProfiles(profiles);
      renderProfilePosts(postsContainer!, posts, 'No posts found.');
    });
  });
}
