import { useRouter } from 'next/router';
import Head from 'next/head';

interface MetaProps {
  title: string;
  description?: string;
  image?: string;
}

export const Meta = ({ title, description, image }: MetaProps) => {
  const router = useRouter();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`;

  return (
    <Head>
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@ryo_manba" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </Head>
  );
};
