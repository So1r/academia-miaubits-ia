import Image from "next/image";

export default function TeamCard({
  src,
  alt,
  name,
  desc
}: { src: string; alt: string; name: string; desc: string }) {
  return (
    <div className="card">
      <Image src={src} alt={alt} width={480} height={720} className="rounded-xl" />
      <h3 className="mt-4 text-2xl font-bold">{name}</h3>
      <p className="opacity-80">{desc}</p>
    </div>
  );
}
