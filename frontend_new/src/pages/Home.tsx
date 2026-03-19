import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/Ui';
import { ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}

export default function Home() {
  const navigate = useNavigate();

  const features: Feature[] = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Browse Sweets',
      description: 'Explore our delicious collection of sweets and pastries',
      action: 'browse',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Track Sales',
      description: 'Monitor your sales trends and performance metrics',
      action: 'dashboard',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Manage Customers',
      description: 'Keep track of your customer information and ratings',
      action: 'customers',
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Inventory',
      description: 'Manage your sweet inventory and stock levels',
      action: 'inventory',
    },
  ];

  const handleFeatureClick = (action: string) => {
    switch (action) {
      case 'browse':
        navigate('/dashboard');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="px-4 py-16 sm:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Welcome to Sweet Shop Manager
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Manage your sweet shop efficiently with our all-in-one management system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
            >
              Get Started
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/sweets')}
            >
              View Catalog
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col items-center text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {feature.description}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFeatureClick(feature.action)}
                >
                  Explore
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-16 bg-indigo-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-indigo-100">Products Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-indigo-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-indigo-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to boost your sweet shop?
          </h2>
          <p className="text-gray-600 mb-8">
            Start managing your inventory, sales, and customers today
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            Launch Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
