"use client";

import { PageTitle } from "@/components/PageTitle";
import { useState } from "react";

const ViewTransitionDemo = () => {
  const [activeView, setActiveView] = useState<"grid" | "detail">(
    "grid",
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const items = [
    {
      id: 1,
      title: "Mountain Landscape",
      color: "bg-blue-500",
      description:
        "Beautiful mountain scenery with snow-capped peaks and clear blue skies.",
    },
    {
      id: 2,
      title: "Ocean Waves",
      color: "bg-cyan-500",
      description:
        "Peaceful ocean waves crashing against the shore at sunset.",
    },
    {
      id: 3,
      title: "Forest Path",
      color: "bg-green-500",
      description: "A serene forest path winding through tall trees.",
    },
    {
      id: 4,
      title: "Desert Dunes",
      color: "bg-orange-500",
      description: "Golden sand dunes stretching as far as the eye can see.",
    },
    {
      id: 5,
      title: "City Lights",
      color: "bg-purple-500",
      description: "Vibrant city lights illuminating the night skyline.",
    },
    {
      id: 6,
      title: "Aurora Borealis",
      color: "bg-pink-500",
      description: "Dancing northern lights painting the Arctic sky.",
    },
  ];

  const handleItemClick = (id: number) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setSelectedItem(id);
        setActiveView("detail");
      });
    } else {
      setSelectedItem(id);
      setActiveView("detail");
    }
  };

  const handleBackClick = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setActiveView("grid");
        setSelectedItem(null);
      });
    } else {
      setActiveView("grid");
      setSelectedItem(null);
    }
  };

  const selectedItemData = items.find((item) => item.id === selectedItem);

  return (
    <>
      <PageTitle title="View Transition API Demo" />
      <div className="flex justify-center my-8 mx-2">
        <div className="max-w-6xl w-full px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              View Transition API デモ
            </h2>
            <p className="text-gray-600 mb-4">
              カードをクリックすると、スムーズなトランジションで詳細ビューに切り替わります。
            </p>
            <p className="text-sm text-gray-500">
              ※ View Transition APIに対応したブラウザ（Chrome 111+, Edge 111+
              など）で表示してください。
            </p>
          </div>

          {activeView === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`${item.color} rounded-lg p-8 text-white hover:opacity-90 transition-opacity cursor-pointer aspect-square flex items-center justify-center`}
                  style={{ viewTransitionName: `item-${item.id}` }}
                >
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </button>
              ))}
            </div>
          ) : (
            selectedItemData && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  ← 戻る
                </button>
                <div
                  className={`${selectedItemData.color} rounded-lg p-16 text-white`}
                  style={{ viewTransitionName: `item-${selectedItemData.id}` }}
                >
                  <h2 className="text-4xl font-bold mb-6">
                    {selectedItemData.title}
                  </h2>
                  <p className="text-xl leading-relaxed">
                    {selectedItemData.description}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-8 mt-6">
                  <h3 className="text-2xl font-bold mb-4">詳細情報</h3>
                  <p className="text-gray-700 mb-4">
                    この要素は、View Transition
                    APIを使用してグリッドビューから詳細ビューへスムーズに遷移しています。
                  </p>
                  <p className="text-gray-700">
                    <code className="bg-white px-2 py-1 rounded">
                      view-transition-name
                    </code>
                    プロパティを使用することで、特定の要素をアニメーション中に追跡し、滑らかな遷移を実現しています。
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        @supports (view-transition-name: none) {
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation-duration: 0.5s;
          }
        }
      `}</style>
    </>
  );
};

export default ViewTransitionDemo;
