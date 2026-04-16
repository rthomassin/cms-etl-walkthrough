export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* If alstom-logo.svg was extracted into /public in Task 4, swap for an <img>. */}
      <div className="w-6 h-6 rounded-full bg-brand-primary" aria-hidden />
      <span className="font-heading text-base text-brand-primary">CMS ETL Walkthrough</span>
    </div>
  );
}
