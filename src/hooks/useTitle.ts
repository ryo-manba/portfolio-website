import { useEffect, useRef } from 'react';

type UseTitleOptions = {
  hasSiteTitle?: boolean;
};

const DEFAULT_USE_TITLE_OPTIONS = {
  hasSiteTitle: true,
};

const SITE_TITLE = 'ryo-manba';

export const useTitle = (
  title: string,
  options: UseTitleOptions = DEFAULT_USE_TITLE_OPTIONS,
) => {
  const documentDefined = typeof document !== 'undefined';
  const prevTitleRef = useRef(documentDefined ? document.title : null);

  useEffect(() => {
    if (!documentDefined) return;
    if (document.title === title) return;

    document.title = options.hasSiteTitle ? `${title} | ${SITE_TITLE}` : title;

    const prevTitle = prevTitleRef.current;
    return () => {
      if (!prevTitle) return;
      document.title = prevTitle;
    };
  }, [documentDefined, options.hasSiteTitle, title]);
};

export default typeof document !== 'undefined'
  ? useTitle
  : (_title: string) => {};
