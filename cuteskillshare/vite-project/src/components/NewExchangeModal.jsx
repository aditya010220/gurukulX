import React, { useState } from 'react';
import Icon from './AppIcon';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

const skillCategories = [
  { value: 'web-dev', label: 'Web Development' },
  { value: 'mobile-dev', label: 'Mobile Development' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'devops', label: 'DevOps & Cloud' },
  { value: 'ai-ml', label: 'AI & Machine Learning' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'video-editing', label: 'Video Editing' },
  { value: 'music', label: 'Music & Audio' },
  { value: 'languages', label: 'Languages' },
  { value: 'marketing', label: 'Digital Marketing' },
  { value: 'writing', label: 'Writing & Content' },
];

const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const availabilityOptions = [
  { value: 'weekday-morning', label: 'Weekday Mornings' },
  { value: 'weekday-afternoon', label: 'Weekday Afternoons' },
  { value: 'weekday-evening', label: 'Weekday Evenings' },
  { value: 'weekend-morning', label: 'Weekend Mornings' },
  { value: 'weekend-afternoon', label: 'Weekend Afternoons' },
  { value: 'weekend-evening', label: 'Weekend Evenings' },
];

const NewExchangeModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [formData, setFormData] = useState({
    offerSkill: '',
    offerCategory: '',
    offerLevel: '',
    learnSkill: '',
    learnCategory: '',
    learnLevel: '',
    availability: '',
    description: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      offerSkill: '',
      offerCategory: '',
      offerLevel: '',
      learnSkill: '',
      learnCategory: '',
      learnLevel: '',
      availability: '',
      description: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={handleReset}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-warm-xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <Icon name="X" size={18} color="var(--color-foreground)" />
        </button>

        {step === 1 && (
          <>
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                  <Icon name="ArrowLeftRight" size={20} color="var(--color-primary-foreground)" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-semibold text-foreground">
                    New Skill Exchange
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us what you want to offer and learn
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* What You Offer */}
              <div className="bg-success/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="Gift" size={16} color="var(--color-success-foreground)" />
                  <p className="text-sm font-semibold text-foreground">What You Offer</p>
                </div>
                <Input
                  label="Skill Name"
                  placeholder="e.g. React Development"
                  value={formData.offerSkill}
                  onChange={(e) => handleChange('offerSkill', e.target.value)}
                  required
                />
                <Select
                  label="Category"
                  placeholder="Select category"
                  options={skillCategories}
                  value={formData.offerCategory}
                  onChange={(val) => handleChange('offerCategory', val)}
                  required
                />
                <Select
                  label="Your Proficiency"
                  placeholder="Select level"
                  options={proficiencyLevels}
                  value={formData.offerLevel}
                  onChange={(val) => handleChange('offerLevel', val)}
                  required
                />
              </div>

              {/* Swap icon divider */}
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="ArrowDownUp" size={20} color="var(--color-primary-foreground)" />
                </div>
              </div>

              {/* What You Want to Learn */}
              <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="GraduationCap" size={16} color="var(--color-secondary-foreground)" />
                  <p className="text-sm font-semibold text-foreground">What You Want to Learn</p>
                </div>
                <Input
                  label="Skill Name"
                  placeholder="e.g. UI/UX Design"
                  value={formData.learnSkill}
                  onChange={(e) => handleChange('learnSkill', e.target.value)}
                  required
                />
                <Select
                  label="Category"
                  placeholder="Select category"
                  options={skillCategories}
                  value={formData.learnCategory}
                  onChange={(val) => handleChange('learnCategory', val)}
                  required
                />
                <Select
                  label="Desired Level"
                  placeholder="Select level"
                  options={proficiencyLevels}
                  value={formData.learnLevel}
                  onChange={(val) => handleChange('learnLevel', val)}
                  required
                />
              </div>

              {/* Availability & Description */}
              <Select
                label="Preferred Availability"
                placeholder="When are you available?"
                options={availabilityOptions}
                value={formData.availability}
                onChange={(val) => handleChange('availability', val)}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Anything else you'd like potential exchange partners to know..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 resize-none"
                />
              </div>

              <Button type="submit" variant="default" fullWidth size="lg" iconName="Send" iconPosition="left">
                Submit Exchange Request
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-success/30 flex items-center justify-center mx-auto">
              <Icon name="CheckCircle2" size={40} color="var(--color-success-foreground)" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                Exchange Request Submitted!
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You've successfully submitted a skill exchange request.
                We'll notify you when we find a great match for{' '}
                <span className="font-semibold text-foreground">{formData.learnSkill || 'your desired skill'}</span>.
              </p>
            </div>

            <div className="bg-muted rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Offering</span>
                <span className="text-sm font-semibold text-foreground">{formData.offerSkill}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Learning</span>
                <span className="text-sm font-semibold text-foreground">{formData.learnSkill}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Close
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setStep(1);
                  setFormData({
                    offerSkill: '',
                    offerCategory: '',
                    offerLevel: '',
                    learnSkill: '',
                    learnCategory: '',
                    learnLevel: '',
                    availability: '',
                    description: '',
                  });
                }}
                className="flex-1"
                iconName="Plus"
                iconPosition="left"
              >
                New Exchange
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewExchangeModal;
