import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface FormData {
  email: string;
  name: string;
}

interface FormErrors {
  email: string;
  name: string;
}

type SubmitStatus = "success" | "error" | null;

const NewsletterForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const close = (): void => {
    setIsOpen(false);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: "",
      name: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.name;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Replace 'YOUR_PLUNK_API_KEY' with your actual Plunk API key
      const response: Response = await fetch(
        "https://api.useplunk.com/v1/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer YOUR_PLUNK_API_KEY`,
          },
          body: JSON.stringify({
            to: "admin@yourcompany.com", // Replace with your admin email
            subject: "New Newsletter Subscription",
            body: `
            <h2>New Newsletter Subscription</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
          `,
            type: "html",
          }),
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ email: "", name: "" });
        // Auto-close after successful submission
        setTimeout((): void => {
          setIsOpen(false);
        }, 2000);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNewsLetter = JSON.parse(
    localStorage.getItem("isNewsLetter") as string
  );

  useEffect(() => {
    if (isNewsLetter === "closed") {
      setIsOpen(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="bg-[#FFFFFFBF] fixed rounded-[30px] pt-[37px] pb-[25px] px-[28px] right-[51px] z-[99] bottom-[36px] w-full max-w-[302px]">
      <button onClick={close} className="absolute top-5 right-5">
        <X />
      </button>

      <h2 className="text-[#000000] font-roboto text-2xl font-semibold">
        Stay Ahead with PAC Research Newsletter
      </h2>

      <p className="text-[11px] font-normal font-roboto mt-[10px] text-[#000000DE]">
        Subscribe to PAC Research's newsletter for quick updates on market
        trends, expert insights, and key developments. Get the latest delivered
        right to your inbox!
      </p>

      <div className="mt-5">
        <div className="mb-3">
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`p-[9px] placeholder:text-[#696666] text-[12px] border ${
              errors.email ? "border-red-500" : "border-[#D8D8D8]"
            } bg-[#F6F6F6] rounded-[2px] w-full`}
            placeholder="your.email@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-3">
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`p-[9px] placeholder:text-[#696666] text-[12px] border ${
              errors.name ? "border-red-500" : "border-[#D8D8D8]"
            } bg-[#F6F6F6] rounded-[2px] w-full`}
            placeholder="Your name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : submitStatus === "success"
              ? "bg-green-500"
              : "bg-[#15BFFD] hover:bg-[#13A8E8]"
          } rounded-[2px] font-medium text-[#000000] py-2.5 text-center w-full text-xs mt-2.5 transition-colors`}
        >
          {isSubmitting
            ? "Subscribing..."
            : submitStatus === "success"
            ? "Subscribed!"
            : "Subscribe"}
        </button>

        {submitStatus === "error" && (
          <p className="text-red-500 text-[10px] mt-2 text-center">
            Failed to subscribe. Please try again.
          </p>
        )}

        {submitStatus === "success" && (
          <p className="text-green-600 text-[10px] mt-2 text-center">
            Successfully subscribed! Thank you.
          </p>
        )}
      </div>

      <p className="text-[11px] text-[#000000DE] mt-[10px]">
        We value your privacy and will never send irrelevant information.
      </p>
    </div>
  );
};

export default NewsletterForm;
