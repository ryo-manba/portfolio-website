"use client";

import { memo } from "react";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
};

export const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const allPages = generatePagination(currentPage, totalPages);

  const handleClick = (pageNumber: number) => {
    onPageChange(pageNumber);
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <PaginationArrow direction="left" onClick={handlePrevClick} isDisabled={currentPage === 1} />
      <ul className="flex items-center">
        {allPages.map((page) => {
          const isActive = page === currentPage;
          const pageNumber = Number(page);

          return (
            <li className="flex mx-0.5" key={page}>
              <PaginationNumber page={page} isActive={isActive} onClick={() => handleClick(pageNumber)} />
            </li>
          );
        })}
      </ul>
      <PaginationArrow direction="right" onClick={handleNextClick} isDisabled={currentPage >= totalPages} />
    </div>
  );
});

type PaginationNumberProps = {
  page: number | string;
  isActive: boolean;
  onClick: () => void;
};
const PaginationNumber = ({ page, isActive, onClick }: PaginationNumberProps) => {
  if (page === "...") {
    return <div>{page}</div>;
  }
  return (
    <button
      className={`
        w-8 h-8 rounded-full border border-gray-400 
        ${isActive ? "bg-gray-300 text-black" : "bg-white text-black hover:bg-gray-200"} 
        transition-colors duration-150 ease-in-out
      `}
      onClick={onClick}
      disabled={isActive}
      type="button"
    >
      {page}
    </button>
  );
};

type PaginationArrowProps = {
  href?: string;
  onClick: () => void;
  direction: "left" | "right";
  isDisabled?: boolean;
};

const PaginationArrow = ({ direction, href, isDisabled, onClick }: PaginationArrowProps) => {
  const icon = direction === "left" ? "<" : ">";
  const baseClasses = "mx-1 w-8 h-8 rounded-full border border-gray-400 bg-white";
  const disabledClasses = "opacity-50 cursor-default";
  const classes = isDisabled ? `${baseClasses} ${disabledClasses}` : baseClasses;

  const getAriaLabel = (direction: "left" | "right", isDisabled?: boolean) => {
    if (isDisabled) {
      return direction === "left" ? "最初のページ" : "最後のページ";
    }
    return direction === "left" ? "前のページへ" : "次のページへ";
  };
  const ariaLabel = getAriaLabel(direction, isDisabled);

  return (
    <button
      className={classes}
      onClick={!isDisabled ? onClick : undefined}
      type="button"
      disabled={isDisabled}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // show all if less then 7 pages
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If current page is the first 4 pages, display pages 1 through 5
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // If current page is the last 4 pages, display from page 4 to the last page
  if (totalPages - 3 <= currentPage) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // Otherwise, display two pages before and after the current page
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};
