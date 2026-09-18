import { getToken, getApiKey, getUser } from './utils/storage.js';
import { createApiKey } from './api/createApiKey.js';

let allPosts: any[] = [];
const selectedTags = new Set<string>();

function normalizeTag(tag: string) {
  return tag.trim().replace(/^#/, '').toLowerCase();
}

function parseTags(value: string) {
  const hashtagMatches = value.match(/#[a-z0-9_-]+/gi);

  if (hashtagMatches) {
    return hashtagMatches.map(normalizeTag);
  }

  return value.split(',').map(normalizeTag).filter(Boolean);
}

function expandTagValue(value: string) {
  return value.includes('#') ? parseTags(value) : [normalizeTag(value)];
}

function getPostTags(post: any) {
  const apiTags = Array.isArray(post.tags)
    ? post.tags
        .map((tag: unknown) => {
          if (typeof tag === 'string') return tag;
          if (tag && typeof tag === 'object' && 'name' in tag) {
            return String(tag.name);
          }
          return '';
        })
        .filter(Boolean)
    : [];
  const bodyTags =
    typeof post.body === 'string'
      ? post.body.match(/#[a-z0-9_-]+/gi) || []
      : [];

  return [...apiTags, ...bodyTags].reduce(
    (tags: string[], value: string) => tags.concat(expandTagValue(value)),
    []
  );
}

function renderFilteredFeed() {
  const searchInput = document.getElementById(
    'searchInput'
  ) as HTMLInputElement | null;
  const query = searchInput?.value.trim().toLowerCase() || '';

  const filteredPosts = allPosts.filter((post) => {
    const postTags = getPostTags(post);
    const searchableText = [
      post.title,
      post.body,
      post.author?.name,
      postTags.join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !query || searchableText.includes(query);
    const matchesTags =
      selectedTags.size === 0 ||
      Array.from(selectedTags).some((tag) => postTags.includes(tag));

    return matchesSearch && matchesTags;
  });

  renderFeed(filteredPosts);
}

// fetch all posts
export async function getPosts() {
  const token = getToken() || '';
  const apiKey = getApiKey() || '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Noroff-API-Key': apiKey,
  };

  const response = await fetch(
    'https://v2.api.noroff.dev/social/posts?_author=true&_reactions=true&_comments=true',
    { headers }
  );

  const data = await response.json();
  return data.data || [];
}

// like a post
export async function likePost(postId: string) {
  const token = getToken() || '';
  const apiKey = getApiKey() || '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Noroff-API-Key': apiKey,
  };

  const response = await fetch(
    `https://v2.api.noroff.dev/social/posts/${postId}/react/%F0%9F%91%8D`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({}),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to like post');
  }

  return data;
}

// comment on a post
export async function commentPost(postId: string, text: string) {
  const token = getToken() || '';
  const apiKey = getApiKey() || '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Noroff-API-Key': apiKey,
  };

  const response = await fetch(
    `https://v2.api.noroff.dev/social/posts/${postId}/comment`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: text }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to comment');
  }

  return data;
}

// Delete a post
export async function deletePost(postId: string) {
  const token = getToken() || '';
  const apiKey = getApiKey() || '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Noroff-API-Key': apiKey,
  };

  const response = await fetch(
    `https://v2.api.noroff.dev/social/posts/${postId}`,
    {
      method: 'DELETE',
      headers,
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.errors?.[0]?.message || 'Failed to delete post');
  }

  return true;
}

export async function updatePost(postId: string, text: string, tags: string[]) {
  const token = getToken() || '';
  const apiKey = getApiKey() || '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Noroff-API-Key': apiKey,
  };

  const response = await fetch(
    `https://v2.api.noroff.dev/social/posts/${postId}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({ body: text, tags }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to update post');
  }

  return data;
}

// render feed
function renderFeed(posts: any[]) {
  const container = document.querySelector('.posts');
  if (!container) return;

  container.innerHTML = '';

  posts.forEach((post) => {
    const card = createPostCard(post);
    container.appendChild(card);
  });

  if (posts.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No posts match the selected filters.</p>';
    return;
  }
}

// load feed
export async function loadFeed() {
  allPosts = await getPosts();
  renderFilteredFeed();
}

// Search functionality

function initPostSearch() {
  const searchButton = document.querySelector('.search-btn');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById(
    'searchInput'
  ) as HTMLInputElement | null;

  if (!searchButton || !searchForm || !searchInput) return;

  searchButton.addEventListener('click', () => {
    searchForm.classList.toggle('hidden');

    if (!searchForm.classList.contains('hidden')) {
      searchInput.focus();
    }
  });

  searchInput.addEventListener('input', () => {
    renderFilteredFeed();
  });
}

function initPostFilters() {
  const filterChips =
    document.querySelectorAll<HTMLButtonElement>('.filter-chip');

  filterChips.forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      const tag = normalizeTag(chip.dataset.tag || '');

      if (tag === 'all') {
        selectedTags.clear();
        filterChips.forEach((item) => item.classList.remove('active'));
        chip.classList.add('active');
      } else {
        chip.classList.toggle('active');
        if (chip.classList.contains('active')) {
          selectedTags.add(tag);
        } else {
          selectedTags.delete(tag);
        }

        const allChip = Array.from(filterChips).find(
          (item) => item.dataset.tag === 'all'
        );
        allChip?.classList.remove('active');

        if (selectedTags.size === 0) {
          allChip?.classList.add('active');
        }
      }

      renderFilteredFeed();
    });
  });
}

// build post card
function createPostCard(post: any) {
  const article = document.createElement('article');
  article.classList.add('card');

  const name = post.author?.name || 'Unknown user';
  const date = new Date(post.created).toLocaleDateString();
  const image = post.media?.url || '';
  const body = post.body || '';
  const postTags = getPostTags(post);
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const currentUser = getUser();
  const isOwnPost = Boolean(
    currentUser &&
    (post.author?.name === currentUser.name ||
      post.author?.name === currentUser.username ||
      post.author?.email === currentUser.email)
  );
  const apiAvatar =
    typeof post.author?.avatar === 'string'
      ? post.author.avatar
      : post.author?.avatar?.url;
  const storedAvatar =
    typeof currentUser?.avatar === 'string'
      ? currentUser.avatar
      : currentUser?.avatar?.url;
  const avatar = isOwnPost
    ? storedAvatar || apiAvatar || 'assets/user.svg'
    : apiAvatar || 'assets/user.svg';

  article.innerHTML = `
    <div class="card-header">
      <img class="avatar" src="${avatar}" alt="">
      <div class="card-user">
        <h4 class="username" data-profile-name="${name}">${name}</h4>
        <span class="timestamp">${date}</span>
      </div>
    </div>

    ${image ? `<img class="post-image" src="${image}" alt="">` : ''}

    <p class="post-text">${body}</p>

    ${
      postTags.length > 0
        ? `<div class="post-tags">${postTags
            .map((tag: string) => `<span class="tag">#${tag}</span>`)
            .join('')}</div>`
        : ''
    }

    <div class="post-comments">
      ${
        comments.length > 0
          ? comments
              .map(
                (comment: any) => `
        <div class="comment">
          <strong>${comment.author?.name || 'Unknown user'}</strong>
          <span>${comment.body || ''}</span>
          <small>${
            comment.created
              ? new Date(comment.created).toLocaleDateString()
              : ''
          }</small>
        </div>
      `
              )
              .join('')
          : '<p class="no-comments">No comments yet.</p>'
      }
    </div>

    <div class="card-footer">
      <div class="icon-group likes">
        <img src="assets/like.svg" alt="Likes">
        <span class="like-count">${post._count?.reactions || 0}</span>
      </div>

      <div class="icon-group comments">
        <img src="assets/comment.svg" alt="Comments">
        <span class="comment-count">${post._count?.comments || 0}</span>
      </div>

      <button class="comment-btn" data-id="${post.id}">Comment</button>
      ${
        isOwnPost
          ? `
      <button class="edit-btn" data-id="${post.id}">Edit</button>
      <button class="delete-btn" data-id="${post.id}">Delete</button>
      `
          : ''
      }

    </div>
  `;

  const avatarImage = article.querySelector('.avatar') as HTMLImageElement;
  avatarImage?.addEventListener('error', () => {
    avatarImage.onerror = null;
    avatarImage.src = 'assets/user.svg';
  });

  article.querySelector('.username')?.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.href = `profile.html?name=${encodeURIComponent(name)}`;
  });

  article.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    if (
      target.closest(
        '.comment-btn, .edit-btn, .delete-btn, .likes, .comments, input, textarea, button'
      )
    ) {
      return;
    }

    window.location.href = `post.html?id=${encodeURIComponent(post.id)}`;
  });

  // like functionality
  const likeGroup = article.querySelector('.likes');
  likeGroup?.addEventListener('click', async () => {
    try {
      await likePost(post.id);
      await loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  });

  // comment functionality
  const commentBtn = article.querySelector('.comment-btn');
  commentBtn?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.placeholder = 'Write a comment...';
    input.className = 'comment-input';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.className = 'comment-send';

    sendBtn.addEventListener('click', async () => {
      try {
        await commentPost(post.id, input.value.trim());
        await loadFeed();
      } catch (error) {
        console.error('Error commenting:', error);
      }

      input.remove();
      sendBtn.remove();
    });

    article.appendChild(input);
    article.appendChild(sendBtn);
  });

  // edit functionality
  const editBtn = article.querySelector('.edit-btn');
  editBtn?.addEventListener('click', () => {
    const input = document.createElement('textarea');
    input.className = 'edit-input';
    input.value = body;

    const tagsInput = document.createElement('input');
    tagsInput.className = 'edit-tags-input';
    tagsInput.placeholder = 'Hashtags, e.g. JS2, Frontend';
    tagsInput.value = postTags.join(', ');

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'edit-save';

    saveBtn.addEventListener('click', async () => {
      try {
        const tags = parseTags(tagsInput.value);
        await updatePost(post.id, input.value.trim(), tags);
        await loadFeed();
      } catch (error) {
        console.error('Error editing post:', error);
      }

      input.remove();
      saveBtn.remove();
    });

    article.appendChild(input);
    article.appendChild(tagsInput);
    article.appendChild(saveBtn);
  });

  // delete functionality
  const deleteBtn = article.querySelector('.delete-btn');
  deleteBtn?.addEventListener('click', async () => {
    const modal = document.getElementById('deleteModal') as HTMLDivElement;
    const cancelBtn = document.getElementById(
      'cancelDelete'
    ) as HTMLButtonElement;
    const confirmBtn = document.getElementById(
      'confirmDelete'
    ) as HTMLButtonElement;

    modal.classList.remove('hidden');

    cancelBtn.onclick = () => modal.classList.add('hidden');

    confirmBtn.onclick = async () => {
      try {
        await deletePost(post.id);
        await loadFeed();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
      modal.classList.add('hidden');
    };
  });

  return article;
}

// create post
export async function createPost(postData: Record<string, unknown>) {
  const token = getToken() || '';
  const apiKey = getApiKey() || '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Noroff-API-Key': apiKey,
  };

  const response = await fetch('https://v2.api.noroff.dev/social/posts', {
    method: 'POST',
    headers,
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to create post');
  }

  return data.data;
}

// modal
export function initCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  const closeBtn = document.querySelector('.close-modal');
  const createBtn = document.querySelector('.center-btn');
  const form = document.getElementById(
    'createPostForm'
  ) as HTMLFormElement | null;
  const textarea = document.getElementById('postBody');

  if (!modal || !closeBtn || !createBtn || !form) return;

  textarea?.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  });

  createBtn.addEventListener('click', (event) => {
    event.preventDefault();
    modal.classList.remove('hidden');
  });
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const body = (document.getElementById('postBody') as HTMLTextAreaElement)
      .value;
    const mediaUrl = (document.getElementById('postMedia') as HTMLInputElement)
      .value;
    const tags = parseTags(
      (document.getElementById('postTags') as HTMLInputElement).value
    );

    const postData: Record<string, unknown> = {
      title: 'Post',
      body,
    };

    if (mediaUrl.trim() !== '') {
      postData.media = { url: mediaUrl };
    }

    if (tags.length > 0) {
      postData.tags = tags;
    }

    try {
      await createPost(postData);
      modal.classList.add('hidden');
      form.reset();
      await loadFeed();
    } catch (error) {
      console.error('Create post error:', error);
    }
  });
}

// init posts
export async function initPosts() {
  const token = getToken();
  const apiKey = getApiKey();

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  if (!apiKey) {
    try {
      await createApiKey();
    } catch (error) {
      window.location.href = 'login.html';
      return;
    }
  }

  await loadFeed();
  initCreatePostModal();
  initPostSearch();
  initPostFilters();
}
