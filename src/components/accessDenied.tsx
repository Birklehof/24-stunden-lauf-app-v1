import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Zugriff verweigert!</h2>
        <p>Du hast keine Berechtigung diese Seite aufzurufen.</p>
        <div className="card-actions justify-end">
          <Link href={'/'}>
            <a className="btn btn-primary">Zurück</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
