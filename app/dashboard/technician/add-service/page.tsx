export default function AddServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Service</h1>
        <p className="text-muted-foreground">Create a new service offer. Upload an image via ImgBB (file input). New services should be submitted for admin approval.</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">Service creation form (title, description, category, price, duration, mode, area, image upload) should be implemented with react-hook-form + zod and POST to the Express API. Technician name/email must be read-only from session.</p>
      </div>
    </div>
  )
}
