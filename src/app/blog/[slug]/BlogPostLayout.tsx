"use client";

import { type ReactNode, useState } from "react";
import { ChromeAiSidebar } from "../components/ChromeAiSidebar";
import { BlogPostContent } from "./BlogPostContent";

type Props = {
	children: ReactNode;
	header: ReactNode;
	content: string;
	lang: string;
};

export function BlogPostLayout({ children, header, content, lang }: Props) {
	const [translatedContent, setTranslatedContent] = useState<string | null>(null);

	return (
		<>
			<ChromeAiSidebar content={content} lang={lang} onTranslate={setTranslatedContent} />
			<article className="min-w-0 text-left" style={{ maxWidth: "40em", width: "100%" }}>
				{header}
				<BlogPostContent translatedContent={translatedContent}>{children}</BlogPostContent>
			</article>
		</>
	);
}
