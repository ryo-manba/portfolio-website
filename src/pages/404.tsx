import type { NextPage } from 'next';

const Custom404: NextPage = () => {
  return (
    <div className="items-center my-24">
      <div className="text-center">
        <h1 className="font-bold text-6xl mb-8">404</h1>
        <p className="text-xl">
          やあ （´・ω・｀)
          <br />
          ようこそ、バーボンハウスへ。
          <br />
          このテキーラはサービスだから、まず飲んで落ち着いて欲しい。
          <br />
          <br />
          うん、「また」なんだ。済まない。
          <br />
          仏の顔もって言うしね、謝って許してもらおうとも思っていない。
          <br />
          <br />
          でも、このページを見たとき、君は、きっと言葉では言い表せない「ときめき」みたいなものを感じてくれたと思う。
          <br />
          殺伐とした世の中で、そういう気持ちを忘れないで欲しい
          <br />
          そう思って、この404ページを作ったんだ。
          <br />
          <br />
          じゃあ、注文を聞こうか。
        </p>
      </div>
    </div>
  );
};
export default Custom404;
