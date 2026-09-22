import { getApiKey, getToken } from '../utils/storage.js';
import type { Post } from '../types/social.js';

const API_URL = 'https://v2.api.noroff.dev';

/**
 * Function to get headers for API.
 * Returns token and API key from local storage if user is logged in.
 */
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${getToken() || ''}`,
    'X-Noroff-API-Key': getApiKey() || '',
  };
}

/**
 * Fetches all social posts, including author information, reactions, and comments from the API.
 * @returns {Promise<Post[]>} A promise that resolves to an array of Post objects.
 * @throws {Error} Returns an error if the fetch fails.
 */
export async function getPosts(): Promise<Post[]> {
  const response = await fetch(
    `${API_URL}/social/posts?_author=true&_reactions=true&_comments=true`,
    { headers: getHeaders() }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to fetch posts');
  }

  return (data.data || []) as Post[];
}
// Send a like reaction to the post
export async function likePost(postId: string | number) {
  const response = await fetch(
    `${API_URL}/social/posts/${postId}/react/%F0%9F%91%8D`,
    { method: 'PUT', headers: getHeaders(), body: JSON.stringify({}) }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to like post');
  }

  return data;
}

// Adds a comment to the post
export async function commentPost(postId: string | number, text: string) {
  const response = await fetch(`${API_URL}/social/posts/${postId}/comment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ body: text }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to comment');
  }

  return data;
}

// Deletes a post by its ID
export async function deletePost(postId: string | number): Promise<boolean> {
  const response = await fetch(`${API_URL}/social/posts/${postId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.errors?.[0]?.message || 'Failed to delete post');
  }

  return true;
}

// Updates a post with new text and tags
export async function updatePost(
  postId: string | number,
  text: string,
  tags: string[]
) {
  const response = await fetch(`${API_URL}/social/posts/${postId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ body: text, tags }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to update post');
  }

  return data;
}

// Creates a new post with the provided data
export async function createPost(postData: Record<string, unknown>) {
  const response = await fetch(`${API_URL}/social/posts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(postData),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Failed to create post');
  }

  return data.data;
}
