'use client';

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-bold italic mb-8 leading-[1.15]">
          <span className="bg-gradient-to-r from-primary via-cyan-300 to-primary bg-clip-text text-transparent">
            Welcome to the Future
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-primary to-cyan-300 bg-clip-text text-transparent">
            of Crypto Ventures
          </span>
        </h1>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-24 mb-16" />

        <p className="text-foreground/60 text-lg font-medium tracking-wider mt-6">
          Powered by Linera
        </p>
      </div>
    </section>
  );
}
