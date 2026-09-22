import type { Post } from '../types/social.js';

const selectedTags = new Set<string>();

export function normalizeTag(tag: string): string {
  return tag.trim().replace(/^#/, '').toLowerCase();
}

/**
 * Parses a string to extract hashtags or comma-separated tags.
 * @param {string} value The raw tag input to parse.
 * @returns {string[]} A list of normalized tag names.
 */
export function parseTags(value: string): string[] {
  const hashtagMatches = value.match(/#[a-z0-9_-]+/gi);
  if (hashtagMatches) return hashtagMatches.map(normalizeTag);
  return value.split(',').map(normalizeTag).filter(Boolean);
}

export function getPostTags(post: Post): string[] {
  const apiTags = Array.isArray(post.tags)
    ? post.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))
    : [];
  const bodyTags =
    typeof post.body === 'string'
      ? post.body.match(/#[a-z0-9_-]+/gi) || []
      : [];

  return [...apiTags, ...bodyTags].reduce(
    (tags: string[], value) => tags.concat(parseTags(value)),
    []
  );
}

export function initPostFilters(
  getPosts: () => Post[],
  render: (posts: Post[]) => void
): void {
  const searchButton = document.querySelector('.search-btn');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById(
    'searchInput'
  ) as HTMLInputElement | null;
  const filterChips =
    document.querySelectorAll<HTMLButtonElement>('.filter-chip');

  const applyFilters = () => {
    const query = searchInput?.value.trim().toLowerCase() || '';
    const filteredPosts = getPosts().filter((post) => {
      const tags = getPostTags(post);
      const text = [post.title, post.body, post.author?.name, tags.join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return (
        (!query || text.includes(query)) &&
        (selectedTags.size === 0 ||
          Array.from(selectedTags).some((tag) => tags.indexOf(tag) !== -1))
      );
    });
    render(filteredPosts);
  };

  searchButton?.addEventListener('click', () => {
    searchForm?.classList.toggle('hidden');
    if (!searchForm?.classList.contains('hidden')) searchInput?.focus();
  });
  searchInput?.addEventListener('input', applyFilters);

  filterChips.forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      const tag = normalizeTag(chip.dataset.tag || '');
      const allChip = Array.from(filterChips).find(
        (item) => item.dataset.tag === 'all'
      );

      if (tag === 'all') {
        selectedTags.clear();
        filterChips.forEach((item) => item.classList.remove('active'));
        chip.classList.add('active');
      } else {
        chip.classList.toggle('active');
        chip.classList.contains('active')
          ? selectedTags.add(tag)
          : selectedTags.delete(tag);
        allChip?.classList.remove('active');
        if (selectedTags.size === 0) allChip?.classList.add('active');
      }
      applyFilters();
    });
  });
}
