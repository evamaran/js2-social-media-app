import type { Post, Comment } from '../types/social.js';
import { getUser } from '../utils/storage.js';
import { getPostTags, parseTags } from './postFilters.js';

import {
  likePost as apiLikePost,
  commentPost as apiCommentPost,
  deletePost as apiDeletePost,
  updatePost as apiUpdatePost,
} from '../api/postsApi.js';

import { loadFeed } from '../posts.js';

// Builds a single post card element with all UI actions
export function createPostCard(post: Post) {
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
    ? storedAvatar || apiAvatar || 'icons/user.svg'
    : apiAvatar || 'icons/user.svg';

  article.innerHTML = `
  <div class="card-header">
    <img class="avatar" src="${avatar}" alt="">
    <div class="card-user">
      <h4 class="username" data-profile-name="${name}">${name}</h4>
      <span class="timestamp">${date}</span>
    </div>
  </div>

  ${
    isOwnPost
      ? `
  <div class="post-actions">
    <button class="edit-btn" data-id="${post.id}" aria-label="Edit post">
      <img src="icons/edit.svg" alt="">
    </button>
    <button class="delete-btn" data-id="${post.id}" aria-label="Delete post">
      <img src="icons/delete.svg" alt="">
    </button>
  </div>
  `
      : ''
  }

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
              (comment: Comment) => `
      <div class="comment">
        <strong>${comment.author?.name || 'Unknown user'}</strong>
        <span>${comment.body || ''}</span>
        <small>${
          comment.created ? new Date(comment.created).toLocaleDateString() : ''
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
      <img src="icons/like.svg" alt="Likes">
      <span class="like-count">${post._count?.reactions || 0}</span>
    </div>

    <div class="icon-group comments">
      <img src="icons/comment.svg" alt="Comments">
      <span class="comment-count">${post._count?.comments || 0}</span>
    </div>
  </div>
`;

  // Avatar fallback
  const avatarImage = article.querySelector('.avatar') as HTMLImageElement;
  avatarImage?.addEventListener('error', () => {
    avatarImage.onerror = null;
    avatarImage.src = 'icons/user.svg';
  });

  // Navigate to profile
  article.querySelector('.username')?.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.href = `profile.html?name=${encodeURIComponent(name)}`;
  });

  // Navigate to post page
  article.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    if (
      target.closest(
        '.edit-btn, .delete-btn, .likes, .comments, input, textarea, button'
      )
    ) {
      return;
    }

    window.location.href = `post.html?id=${encodeURIComponent(post.id)}`;
  });

  // Like functionality
  const likeGroup = article.querySelector('.likes');
  likeGroup?.addEventListener('click', async () => {
    try {
      await apiLikePost(post.id);
      await loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  });

  // Comment functionality
  const commentGroup = article.querySelector('.comments');
  commentGroup?.addEventListener('click', () => {
    const existingInput = article.querySelector('.comment-input');
    if (existingInput) {
      existingInput.remove();
      article.querySelector('.comment-send')?.remove();
      return;
    }

    const input = document.createElement('input');
    input.placeholder = 'Write a comment...';
    input.className = 'comment-input';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.className = 'comment-send';

    sendBtn.addEventListener('click', async () => {
      try {
        await apiCommentPost(post.id, input.value.trim());
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

  // Edit functionality
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
        await apiUpdatePost(post.id, input.value.trim(), tags);
        await loadFeed();
      } catch (error) {
        console.error('Error editing post:', error);
      }

      input.remove();
      tagsInput.remove();
      saveBtn.remove();
    });

    article.appendChild(input);
    article.appendChild(tagsInput);
    article.appendChild(saveBtn);
  });

  // Delete functionality
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
        await apiDeletePost(post.id);
        await loadFeed();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
      modal.classList.add('hidden');
    };
  });

  return article;
}
