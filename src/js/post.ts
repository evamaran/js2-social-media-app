import { getApiKey, getToken } from './utils/storage.js';

const API_URL = 'https://v2.api.noroff.dev';

function getHeaders(): HeadersInit {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${getToken() || ''}`,
    'X-Noroff-API-Key': getApiKey() || '',
  };
}

function getAvatarUrl(author: any) {
  return typeof author?.avatar === 'string'
    ? author.avatar
    : author?.avatar?.url || 'assets/user.svg';
}

function renderPost(post: any) {
  const container = document.getElementById('singlePost');
  if (!container) return;

  const comments = Array.isArray(post.comments) ? post.comments : [];
  const image = post.media?.url
    ? `<img class="post-image" src="${post.media.url}" alt="">`
    : '';

  container.innerHTML = `
    <article class="card single-post-card">
      <div class="card-header">
        <img class="avatar" src="${getAvatarUrl(post.author)}" alt="">
        <div class="card-user">
          <h4 class="username">${post.author?.name || 'Unknown user'}</h4>
          <span class="timestamp">${new Date(post.created).toLocaleDateString()}</span>
        </div>
      </div>
      ${image}
      <p class="post-text">${post.body || ''}</p>
      <div class="post-comments">
        ${
          comments.length
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
          </div>`
                )
                .join('')
            : '<p class="no-comments">No comments yet.</p>'
        }
      </div>
      <div class="card-footer">
        <span>Likes: ${post._count?.reactions || 0}</span>
        <span>Comments: ${post._count?.comments || comments.length}</span>
      </div>
    </article>
  `;
}

export async function initPost() {
  const container = document.getElementById('singlePost');
  const postId = new URLSearchParams(window.location.search).get('id');

  if (!container || !postId) {
    if (container) container.innerHTML = '<p>Post not found.</p>';
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/social/posts/${encodeURIComponent(
        postId
      )}?_author=true&_reactions=true&_comments=true`,
      { headers: getHeaders() }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Could not load post');
    }

    renderPost(data.data);
  } catch (error) {
    console.error('Could not load post:', error);
    container.innerHTML = '<p>Could not load this post.</p>';
  }
}
