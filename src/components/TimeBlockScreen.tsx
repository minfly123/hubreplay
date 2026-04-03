import { AlertTriangle } from "lucide-react";

const TimeBlockScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
        <h1 className="text-xl font-display font-bold text-foreground">
          ⚠️ Waktu Perangkat Tidak Sesuai
        </h1>
        <p className="text-muted-foreground text-sm">
          Browser mendeteksi bahwa jam di perangkat kamu tidak sesuai dengan waktu sebenarnya. 
          Ini bisa terjadi jika kamu mengubah pengaturan waktu secara manual.
        </p>
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <p className="text-sm text-foreground font-medium">
            Untuk mengakses Hub Replay, pastikan:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left list-disc list-inside">
            <li>Atur waktu perangkat ke <strong>Otomatis</strong></li>
            <li>Pastikan zona waktu sesuai lokasi kamu</li>
            <li>Refresh halaman setelah memperbaiki waktu</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium"
        >
          Refresh Halaman
        </button>
      </div>
    </div>
  );
};

export default TimeBlockScreen;
