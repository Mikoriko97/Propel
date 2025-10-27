import { useState } from 'react';
import { Check } from 'lucide-react';

export function CreateProjectPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'AI/ML',
    milestoneTitle: '',
    successCriteria: ['', '', ''],
    deliverables: ['', ''],
    marketDuration: '7',
    developmentDuration: '60',
  });

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Milestone 1' },
    { number: 3, title: 'Timeline' },
    { number: 4, title: 'Preview' },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateArrayField = (field: string, index: number, value: string) => {
    const array = [...(formData[field as keyof typeof formData] as string[])];
    array[index] = value;
    updateFormData(field, array);
  };

  const addArrayField = (field: string) => {
    const array = [...(formData[field as keyof typeof formData] as string[])];
    array.push('');
    updateFormData(field, array);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.milestoneTitle &&
               formData.successCriteria.filter(c => c.trim()).length >= 3 &&
               formData.deliverables.filter(d => d.trim()).length >= 2;
      case 3:
        return formData.marketDuration && formData.developmentDuration;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    console.log('Submitting project:', formData);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Create New Project</h1>
          <p className="text-lg text-[var(--text-muted)]">
            Submit your idea and get milestone-based funding
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep > step.number
                        ? 'bg-emerald-dark text-white'
                        : currentStep === step.number
                        ? 'bg-emerald-light text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-muted)]'
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= step.number
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? 'bg-emerald-dark'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-gray-200 dark:border-gray-800 rounded-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., ScribeAI: AI-Powered Writing Assistant"
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                >
                  <option value="AI/ML">AI/ML</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="EdTech">EdTech</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your project, its purpose, and what makes it unique..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light resize-none"
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Minimum 100 characters. Be specific about your goals and target audience.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Milestone 1 Definition
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Define clear, objective criteria that can be verified by reviewers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={formData.milestoneTitle}
                  onChange={(e) => updateFormData('milestoneTitle', e.target.value)}
                  placeholder="e.g., MVP Development and Launch"
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Success Criteria * (minimum 3)
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Each criterion must be objective and verifiable. Avoid subjective terms like "good" or "quality".
                </p>
                <div className="space-y-3">
                  {formData.successCriteria.map((criterion, index) => (
                    <input
                      key={index}
                      type="text"
                      value={criterion}
                      onChange={(e) => updateArrayField('successCriteria', index, e.target.value)}
                      placeholder={`Criterion ${index + 1}: e.g., 100+ registered users with verified accounts`}
                      className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                    />
                  ))}
                  <button
                    onClick={() => addArrayField('successCriteria')}
                    className="text-sm text-emerald-light hover:text-emerald-dark font-medium"
                  >
                    + Add Another Criterion
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Required Deliverables * (minimum 2)
                </label>
                <div className="space-y-3">
                  {formData.deliverables.map((deliverable, index) => (
                    <input
                      key={index}
                      type="text"
                      value={deliverable}
                      onChange={(e) => updateArrayField('deliverables', index, e.target.value)}
                      placeholder={`Deliverable ${index + 1}: e.g., Live product URL`}
                      className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                    />
                  ))}
                  <button
                    onClick={() => addArrayField('deliverables')}
                    className="text-sm text-emerald-light hover:text-emerald-dark font-medium"
                  >
                    + Add Another Deliverable
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline Settings</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Market Duration (days) *
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  How long will the prediction market stay open for betting?
                </p>
                <input
                  type="number"
                  value={formData.marketDuration}
                  onChange={(e) => updateFormData('marketDuration', e.target.value)}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Recommended: 7-14 days
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Development Duration (days) *
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  How long do you need to complete this milestone after the market closes?
                </p>
                <input
                  type="number"
                  value={formData.developmentDuration}
                  onChange={(e) => updateFormData('developmentDuration', e.target.value)}
                  min="7"
                  max="180"
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Be realistic. Backers will evaluate if your timeline is achievable.
                </p>
              </div>

              <div className="p-4 bg-emerald-light/5 border border-emerald-light/20 rounded-lg">
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  Total Timeline
                </h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Market closes: {formData.marketDuration} days from launch
                  <br />
                  Milestone deadline: {parseInt(formData.marketDuration) + parseInt(formData.developmentDuration)} days from launch
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Review & Submit</h2>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">{formData.title}</h3>
                  <span className="px-2 py-1 bg-emerald-light/10 text-emerald-dark dark:text-emerald-light text-xs font-medium rounded">
                    {formData.category}
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] mt-3">{formData.description}</p>
                </div>

                <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">
                    {formData.milestoneTitle}
                  </h4>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Success Criteria:</p>
                    <ul className="space-y-1">
                      {formData.successCriteria.filter(c => c.trim()).map((criterion, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                          <span className="text-emerald-light">•</span>
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Deliverables:</p>
                    <ul className="space-y-1">
                      {formData.deliverables.filter(d => d.trim()).map((deliverable, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                          <span className="text-emerald-light">✓</span>
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">Timeline</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Market Duration: {formData.marketDuration} days
                    <br />
                    Development Duration: {formData.developmentDuration} days
                  </p>
                </div>
              </div>

              <div className="p-4 bg-ruby/5 border border-ruby/20 rounded-lg">
                <p className="text-sm text-[var(--text-secondary)]">
                  By submitting this project, you agree to complete the milestone within the specified timeline.
                  If criteria are not met, you will not receive funding, and YES bettors will lose their stakes.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-emerald-light hover:bg-emerald-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-emerald-light hover:bg-emerald-dark text-white font-bold rounded-lg transition-colors"
              >
                Submit Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
