import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const CulturalBackground = () => {
  const culturalElements = [
    // {
    //   icon: 'UtensilsCrossed',
    //   title: 'Authentic Flavors',
    //   description: 'Traditional recipes passed down through generations'
    // },
    // {
    //   icon: 'Heart',
    //   title: 'Made with Love',
    //   description: 'Every dish crafted with care and passion'
    // },
    // {
    //   icon: 'Users',
    //   title: 'Community Driven',
    //   description: 'Supporting local caterers and rural communities'
    // }
  ];

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary rounded-full"></div>
        <div className="absolute top-32 right-20 w-24 h-24 border-2 border-secondary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 border-2 border-accent rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-28 h-28 border-2 border-primary rounded-full"></div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col justify-center items-center p-12 relative z-10 w-full">
        {/* Hero Image */}
        <div className="mb-8 relative">
          <div className="w-80 h-80 rounded-full overflow-hidden cultural-shadow-moderate">
            <Image
              src="public/login.png"
              alt="Traditional Indian cooking with clay pots and spices"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center cultural-shadow-subtle">
            <img
              src="https://i.pinimg.com/1200x/09/93/33/0993332fb9e24b8e2fb8995e4adccb75.jpg"
              alt="Images" 
              width={58}
              height={58}
              className="rounded-full"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center cultural-shadow-subtle">
            <img
              src="https://i.pinimg.com/1200x/c2/8d/50/c28d50f98712814b9c744fe1b3e80bda.jpg"
              alt="Images" 
              width={58}
              height={58}
              className="rounded-full"
            />
          </div>
        </div>
        
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Welcome to GurukulX
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Discover practical skills shared by learners across India. Connect through collaborative learning and support a growing peer community.
          </p>
        </div>
        
        {/* Cultural Features */}
        <div className="space-y-6 w-full max-w-md">
          {culturalElements.map((element, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-card rounded-lg cultural-shadow-subtle">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name={element.icon} size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground mb-1">{element.title}</h3>
                <p className="text-sm text-muted-foreground">{element.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-8 flex items-center space-x-6 text-center">
          <div>
           <div className="text-2xl font-bold text-green-500">
  500+
</div>

            <div className="text-sm text-muted-foreground caption">Caterers</div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div>
            <div className="text-2xl font-bold text-green-500 data-text">10K+</div>
            <div className="text-sm text-muted-foreground caption">Happy Customers</div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div>
            <div className="text-2xl font-bold text-green-500 data-text">25+</div>
            <div className="text-sm text-muted-foreground caption">States Covered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalBackground;
