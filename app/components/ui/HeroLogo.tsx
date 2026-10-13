import Image from "next/image";

/**
 * The logo in its gold frame, as shown at the top of Contact / Our Vision.
 * `glow` adds the soft orange halo used on the navy hero bands; `light`
 * softens the shadow for cream backgrounds (Library).
 */
export default function HeroLogo({
  size = 164,
  mobileSize,
  glow = false,
  light = false,
}: {
  size?: number;
  mobileSize?: number;
  glow?: boolean;
  light?: boolean;
}) {
  return (
    <div
      className={light ? "hero-logo hero-logo--light" : "hero-logo"}
      style={
        {
          "--logo-size": `${size}px`,
          "--logo-size-m": `${mobileSize ?? size}px`,
        } as React.CSSProperties
      }
    >
      {glow && <div className="hero-logo__glow" aria-hidden="true" />}
      <div className="hero-logo__frame">
        <div className="hero-logo__inner">
          <Image
            src="/images/logo-v4.png"
            alt="Bhakthi Bookshelf"
            width={size}
            height={size}
            sizes={`${size}px`}
            className="hero-logo__img"
            priority
          />
        </div>
      </div>
    </div>
  );
}
