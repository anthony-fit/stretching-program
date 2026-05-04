import { Method } from '../components/Method';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';

export default function MethodPage() {
  const navigate = useNavigate();
  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Methodology", url: "/method" }
  ];

  return (
    <div className="bg-cream selection:bg-gold pb-20">
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <Method onStart={() => navigate('/')} />
      </main>
    </div>
  );
}
