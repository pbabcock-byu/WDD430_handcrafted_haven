export default function UnauthorizedPage() {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You must be an authenticated artisan to upload products.</p>
        </div>
      </div>
    );
  }
  