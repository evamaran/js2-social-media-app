import { getToken, getApiKey } from './utils/storage.js';
import { createApiKey } from './api/createApiKey.js';
import type { Post } from './types/social.js';

import {
  createPost as apiCreatePost,
  getPosts as apiGetPosts,
} from './api/postsApi.js';
import { initPostFilters } from './ui/postFilters.js';
import { createPostCard } from './ui/postCard.js';

let allPosts: Post[] = [];

// Renders the feed with post cards
function renderFeed(posts: Post[]) {
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
  }
}

/**
 * Fetches all posts from the API and updates the feed.
 *
 * This function retrieves all posts using the API, stores them in the local variable `allPosts`,
 * and then renders the feed with the fetched posts.
 *
 * @returns {Promise<void>} A promise that resolves when the feed has been updated.
 * @example
 * ```js
 * // Refresh the feed after creating a new post:
 * await loadFeed();
 * ```
 */
export async function loadFeed() {
  allPosts = await apiGetPosts();
  renderFeed(allPosts);
}

// Handles the create-post modal
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
    const tagsInput = (document.getElementById('postTags') as HTMLInputElement)
      .value;

    const postData: Record<string, unknown> = {
      title: 'Post',
      body,
    };

    if (mediaUrl.trim() !== '') {
      postData.media = { url: mediaUrl };
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tags.length > 0) {
      postData.tags = tags;
    }

    try {
      await apiCreatePost(postData);
      modal.classList.add('hidden');
      form.reset();
      await loadFeed();
    } catch (error) {
      console.error('Create post error:', error);
    }
  });
}

// Initializes posts, modal and filters
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
    } catch {
      window.location.href = 'login.html';
      return;
    }
  }

  await loadFeed();
  initCreatePostModal();
  initPostFilters(() => allPosts, renderFeed);
}
