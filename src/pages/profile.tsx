import Image from 'next/image';

const PROFILE_IMAGE_PATH = '/images/profile-image5.png';

const Profile = () => {
  return (
    <div className="mt-12">
      <h1 className="text-center text-4xl font-bold mb-5">Profile</h1>
      <section className="flex items-center justify-center mt-12 ml-16 space-x-6">
        <Image
          src={PROFILE_IMAGE_PATH}
          alt="Profile Image"
          className="w-32 h-32 mb-2 rounded-full border-4 border-white"
          width={250}
          height={250}
        />
        <div>
          <h2 className="text-[26px] mb-2">
            <ruby>
              松川 陵<rt className="text-gray-400">Matsukawa Ryo</rt>
            </ruby>
          </h2>
          <p>
            42 Tokyo / Wine Sommelier
            <br />
            サイボウズの23卒エンジニア
          </p>
        </div>
      </section>
    </div>
  );
};

export default Profile;
