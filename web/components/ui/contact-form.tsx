import React, { useState } from 'react';
// import { submitContactForm } from '../../lib/mailchimp';
import { Button } from './button';
import { Input } from './input';
import { TextArea } from './textarea';
import { showSuccessToast, showErrorToast } from '../utils/toastNotifications';
import { validateEmail } from '../utils/validateEmail';

const ContactForm: React.FC = () => {
  //refactor into just one useState object
  const [formInput, setFormInput] = useState({
    name: '',
    email: '',
    message: '',
    subscribeNewsletter: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement;
    setFormInput((prev) => ({
      ...prev,
      [target.id]: target.type === 'checkbox' ? target.checked : target.value,
    }));
  };

  // converted validateEmail into a module for import and reuse

  //prevents user from clicking submit button when forms are empty
  //imported regex for use from ../utils/validateEmail
  const isFormValid = () => {
    return (
      formInput.name.trim() !== '' &&
      formInput.email.trim() !== '' &&
      formInput.message.trim() !== '' &&
      validateEmail(formInput.email)
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //extract values from form input
    const { name, email, message, subscribeNewsletter } = formInput;
    // replace alert with toasts

    //only used here so no need to turn into module
    if (!name || !email || !message) {
      showErrorToast('Please fill in all fields');
      return;
    }
    // replace alert with toasts
    if (!validateEmail(email)) {
      showErrorToast('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // const success = await submitContactForm({
      //   name,
      //   email,
      //   message,
      //   subscribeNewsletter,
      // });
      const success = true;
      //change success to true to test sucess toasts
      if (success) {
        //add toast here
        showSuccessToast('Message succesfully sent!');
        setFormInput({
          name: '',
          email: '',
          message: '',
          subscribeNewsletter: false,
        }); // clear form upon successful submission
      } else {
        //add failure toast here
        showErrorToast('Error sending message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showErrorToast('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-black mb-1"
        >
          Name
        </label>
        <Input
          type="text"
          id="name"
          placeholder="John Doe"
          value={formInput.name}
          //move function to const handleChange instead
          onChange={handleChange}
          // required
          className="mt-1 block w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-black mb-1"
        >
          Email
        </label>
        <Input
          type="email"
          id="email"
          placeholder="johndoe@gmail.com"
          value={formInput.email}
          onChange={handleChange}
          // required
          className="mt-1 block w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-black mb-1"
        >
          Message
        </label>
        <TextArea
          id="message"
          value={formInput.message}
          placeholder="Type message here..."
          //move function to handlechange
          onChange={handleChange}
          // required
          rows={4}
          className="mt-1 block w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex items-center">
        <Input
          type="checkbox"
          //changed name to make more readable
          id="subscribeNewsletter"
          checked={formInput.subscribeNewsletter}
          onChange={handleChange}
          className="h-4 w-4 text-white bg-white focus:ring-black border-gray-300 rounded"
        />
        <label
          htmlFor="subscribeNewsletter"
          className="ml-2 block text-sm text-black"
        >
          Subscribe to newsletter
        </label>
      </div>
      <div>
        {/* can import button as component for reuse in both contact form and newsletter then customize it here */}
        <Button
          type="submit"
          // can disable submitting if forms are empty
          disabled={isSubmitting || !isFormValid()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-black swap-button-style focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:opacity-50"
        >
          <span className="text-black text-sm">
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </span>
        </Button>
      </div>
      {/* removed plain text notifications. replaced with toasts instead.   */}
    </form>
  );
};

export default ContactForm;
