import { Links } from "./links";
import { Avatar } from "@/components/Avatar";

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center px-3 max-w-screen-lg mx-auto py-32">
      <div className="flex flex-col items-center md:flex-row md:gap-x-16 md:justify-between justify-center">
        <div className="text-center md:text-start">
          <h1 className="font-bold text-3xl">
            Hi there 👋
            <br />
            I&#x27;m Ryo Matsukawa
          </h1>
          <Links />
        </div>
        <Avatar />
      </div>
    </div>
  );
};

export default Home;
