import { useState } from 'react';
// dont need to use import react from react anymore w/ versions 18+
// import { subscribeToNewsletter } from '@/lib/mailchimp';
import posthog from 'posthog-js';
import { Button } from './button';
import { Input } from './input';
import { showSuccessToast, showErrorToast } from '../utils/toastNotifications';
import { validateEmail } from '../utils/validateEmail';

const NewsletterInput: React.FC = () => {
  const [email, setEmail] = useState('');

  const isFormValid = () => email.trim() !== '' && validateEmail(email);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid()) {
      showErrorToast('Please enter a valid email address.');
      return;
    }
    // Call the subscribeToNewsletter function
    // const success = await subscribeToNewsletter({ email });
    // set success to true to test
    const success = true;

    if (success) {
      setEmail('');
      showSuccessToast('Subscription succesful :D ');
    } else {
      // can show more specific error based on status codes
      showErrorToast('Error signing up with email :( ');
    }

    posthog.capture('Newsletter Subscription', { email });
  };

  return (
    <div id="newsletter-section" className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row sm:space-x-2"
      >
        <Input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          // forms by default can be submitted with enter. no need to set onkeypress
          placeholder="Enter your email"
          className="mt-1 block w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          // required
        />
        {/* disables button until it passes the regex test */}
        <Button
          disabled={!isFormValid()}
          type="submit"
          className="mt-2 sm:mt-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-black swap-button-style focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <span className="text-primary-content text-sm">Subscribe</span>
        </Button>
      </form>
    </div>
  );
};

export default NewsletterInput;
