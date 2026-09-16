// Fetch all posts from the API
export async function getPosts() {
  const token = localStorage.getItem('token')?.trim();

  const response = await fetch('https://v2.api.noroff.dev/social/posts', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.data || [];
}

// Create a new post
export async function createPost(postData: Record<string, unknown>) {
  const token = localStorage.getItem('token')?.trim();

  const response = await fetch('https://v2.api.noroff.dev/social/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();
  return data;
}

// Load posts and render them into the feed
export async function loadFeed() {
  const posts = await getPosts();
  renderFeed(posts);
}

// Render all posts into the .posts container
function renderFeed(posts: any[]) {
  const container = document.querySelector('.posts');
  if (!container) return;

  container.innerHTML = '';

  posts.forEach((post: any) => {
    const card = createPostCard(post);
    container.appendChild(card);
  });
}

// Build a single post card element
function createPostCard(post: {
  author: { avatar?: string; name?: string };
  created: string | number | Date;
  media?: { url?: string };
  body?: string;
  _count?: { reactions?: number; comments?: number };
}) {
  const article = document.createElement('article');
  article.classList.add('card');

  const avatar = post.author?.avatar || 'https://placehold.co/60x60';
  const name = post.author?.name || 'Unknown user';
  const date = new Date(post.created).toLocaleDateString();
  const image = post.media?.url || '';
  const body = post.body || '';

  // Template literal for post card layout
  article.innerHTML = `
    <div class="card-header">
      <img class="avatar" src="${avatar}" alt="">
      <div class="card-user">
        <h4 class="username">${name}</h4>
        <span class="timestamp">${date}</span>
      </div>
    </div>

    ${image ? `<img class="post-image" src="${image}" alt="">` : ''}

    <p class="post-text">${body}</p>

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

  return article;
}

// Setup modal for creating new posts
export function initCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  const closeBtn = document.querySelector('.close-modal');
  const createBtn = document.querySelector('.center-btn');
  const form = document.getElementById('createPostForm');
  const textarea = document.getElementById('postBody');

  if (!modal || !closeBtn || !createBtn || !form) return;

  // Auto-resize textarea based on content
  textarea?.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  });

  // Open and close modal
  createBtn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const body = (document.getElementById('postBody') as HTMLTextAreaElement)
      .value;
    const mediaUrl = (document.getElementById('postMedia') as HTMLInputElement)
      .value;

    const postData: Record<string, unknown> = { body };

    if (mediaUrl.trim() !== '') {
      postData.media = { url: mediaUrl };
    }

    await createPost(postData);

    modal.classList.remove('open');
    await loadFeed();
  });
}

// Initialize everything related to posts
export async function initPosts() {
  const token = localStorage.getItem('token');

  // Redirect if user is not logged in
  if (!token) {
    console.warn('No token found — redirecting to login.');
    window.location.href = 'login.html';
    return;
  }

  // Load posts and enable modal
  await loadFeed();
  initCreatePostModal();
}
