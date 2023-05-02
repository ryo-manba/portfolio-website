// src/hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { useHatena } from './useHatena';
import { useNote } from './useNote';
import { useQiita } from './useQiita';
import { Post } from '../types/Post';

export const usePosts = () => {
  const {
    posts: hatenaPosts,
    error: errorHatena,
    isLoading: isLoadingHatena,
  } = useHatena();
  const {
    posts: notePosts,
    error: errorNote,
    isLoading: isLoadingNote,
  } = useNote(1);
  const {
    posts: qiitaPosts,
    error: errorQiita,
    isLoading: isLoadingQiita,
  } = useQiita();

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (isLoadingHatena || isLoadingNote || isLoadingQiita) {
      return;
    }
    // 新しい順に並び替える
    const allPosts = [...hatenaPosts, ...notePosts, ...qiitaPosts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setPosts(allPosts);
  }, [
    hatenaPosts,
    notePosts,
    qiitaPosts,
    isLoadingHatena,
    isLoadingNote,
    isLoadingQiita,
  ]);

  const error = errorHatena || errorNote || errorQiita;
  const isLoading = isLoadingHatena || isLoadingNote || isLoadingQiita;

  return { posts, error, isLoading };
};
