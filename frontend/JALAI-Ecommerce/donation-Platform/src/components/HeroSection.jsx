const HeroSection = () => {
  return (
    <section
      className="bg-cover bg-center h-[400px] flex items-center justify-center text-white px-6"
      style={{
        backgroundImage: "url('/sample-hero.jpg')", // correct path for public folder
      }}
    >
      <div className="bg-black bg-opacity-50 p-8 rounded text-center max-w-xl">
        <h1 className="text-3xl font-bold mb-4">Welcome to JALAI Marketplace</h1>
        <p className="mb-6">
          Buy, sell, or donate used items with ease and help those in need!
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
