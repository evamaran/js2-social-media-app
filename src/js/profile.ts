import { getApiKey, getToken, getUser } from './utils/storage.js';

interface User {
  name: string | null;
  email: string | null;
  accessToken: string | null;
  username?: string;
  avatar?: string;
}

const API_URL = 'https://v2.api.noroff.dev';

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${getToken() || ''}`,
    'X-Noroff-API-Key': getApiKey() || '',
  };
}

async function getPostsForProfiles(profiles: any[]) {
  const postsByProfile = await Promise.all(
    profiles.map(async (profile) => {
      const response = await fetch(
        `${API_URL}/social/profiles/${encodeURIComponent(profile.name)}/posts`,
        { headers: getHeaders() }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return (data.data || []).map((post: any) => ({
        ...post,
        profileName: profile.name,
      }));
    })
  );

  return postsByProfile.reduce(
    (allPosts: any[], profilePosts: any[]) => allPosts.concat(profilePosts),
    []
  );
}

function renderProfilePosts(
  postsContainer: Element,
  posts: any[],
  emptyMessage: string
) {
  if (posts.length === 0) {
    postsContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  postsContainer.innerHTML = posts
    .map(
      (post: any) => `
      <article class="post-card">
        <small class="post-author">${post.profileName || ''}</small>
        ${post.media?.url ? `<img src="${post.media.url}" class="post-image" alt="">` : ''}
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        <div class="post-tags">
          ${(post.tags || [])
            .map((tag: string) => `<span class="tag">${tag}</span>`)
            .join('')}
        </div>
      </article>
    `
    )
    .join('');
}

export async function initProfile() {
  const user = getUser() as User;
  if (!user) return;

  const profileName = new URLSearchParams(window.location.search).get('name');
  const username = profileName || user.username;

  // Restore username if missing
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

  // DOM elements
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
  const followBtn = document.querySelector('.follow-btn') as HTMLButtonElement;
  const tabs =
    document.querySelectorAll<HTMLButtonElement>('.profile-tabs .tab');
  const postsTab = document.querySelector('.profile-tabs [data-tab="posts"]');

  if (!username) return;

  if (postsTab) {
    postsTab.textContent = profileName ? 'Posts' : 'My posts';
  }

  // Fill profile info
  if (!profileName) {
    if (nameEl) nameEl.textContent = user.name || '';
    if (emailEl) emailEl.textContent = user.email || '';
  }

  if (!profileName && avatarEl && user.avatar) {
    avatarEl.src = user.avatar;
  }

  if (!profileName && avatarInput && user.avatar) {
    avatarInput.value = user.avatar;
  }

  if (profileName) {
    document.querySelector('.profile-actions')?.classList.add('hidden');
    document
      .querySelector('.profile-avatar-wrapper input')
      ?.classList.add('hidden');
    document.querySelector('.btn-save-avatar')?.classList.add('hidden');
  }

  // Save avatar
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
            body: JSON.stringify({
              avatar: {
                url,
                alt: 'Profile picture',
              },
            }),
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
      } catch (error) {
        console.error('Could not save profile picture:', error);
      } finally {
        saveAvatarBtn.disabled = false;
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }

  // Ensure username exists before fetching posts
  if (!username) {
    if (postsContainer) {
      postsContainer.innerHTML = `<p class="error">Error: User not found.</p>`;
    }
    return;
  }

  const profileResponse = await fetch(
    `${API_URL}/social/profiles/${encodeURIComponent(
      username
    )}?_followers=true&_following=true`,
    { headers: getHeaders() }
  );

  const profileData = await profileResponse.json();

  if (profileResponse.ok) {
    const profileAvatar = profileData.data?.avatar?.url;

    if (nameEl) nameEl.textContent = profileData.data?.name || username;
    if (emailEl) emailEl.textContent = profileData.data?.email || '';

    if (profileAvatar) {
      user.avatar = profileAvatar;
      localStorage.setItem('user', JSON.stringify(user));

      if (avatarEl) avatarEl.src = profileAvatar;
      if (avatarInput) avatarInput.value = profileAvatar;
    }

    if (profileName && followBtn) {
      const isFollowing = (profileData.data?.followers || []).some(
        (follower: any) => follower.name === user.name
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
            `${API_URL}/social/profiles/${encodeURIComponent(
              username
            )}/${action}`,
            {
              method: 'PUT',
              headers: getHeaders(),
            }
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
    const ownPosts = ownPostsData.data || [];

    if (postsContainer) {
      renderProfilePosts(postsContainer, ownPosts, 'No posts yet.');
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', async () => {
        tabs.forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');

        const tabType = tab.dataset.tab;

        if (!tabType || tabType === 'posts') {
          renderProfilePosts(postsContainer!, ownPosts, 'No posts yet.');
          return;
        }

        const profiles = profileData.data?.[tabType] || [];
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
}
