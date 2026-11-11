import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import React, { useState } from "react";
import PageBanner from "../components/Layout/PageBanner";
import { callSendContactMessage } from "../firebase/functions";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const emptyForm: ContactForm = { name: "", email: "", subject: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form: ContactForm): Partial<ContactForm> => {
  const errors: Partial<ContactForm> = {};
  if (form.name.trim().length < 2) errors.name = "Please enter your name";
  if (!EMAIL_RE.test(form.email.trim()))
    errors.email = "Please enter a valid email address";
  if (!form.subject.trim()) errors.subject = "Please enter a subject";
  if (form.message.trim().length < 10)
    errors.message = "Message must be at least 10 characters";
  return errors;
};

const Contact = () => {
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    setStatus(null);
    try {
      await callSendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setForm(emptyForm);
      setStatus({
        type: "success",
        text: "Thank you! Your message has been sent. We'll get back to you within 24 hours.",
      });
    } catch (err) {
      console.error("Contact form error:", err);
      const message = (err as { message?: string })?.message;
      setStatus({
        type: "error",
        text:
          message && !/internal/i.test(message)
            ? message
            : "Your message could not be sent. Please try again or email info@pacresearch.org.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: keyof ContactForm) =>
    `bg-white p-[15px] w-full border ${
      errors[field] ? "border-red-500" : "border-transparent"
    }`;
  const errorText = (field: keyof ContactForm) =>
    errors[field] ? (
      <p className="text-red-600 text-xs mt-1">{errors[field]}</p>
    ) : null;

  return (
    <>
      {/* <Helmet>
        <title>contactdd</title>
        <meta name="description" content="test content" data-rh="true" />
        <link rel="canonical" href="/about" />
      </Helmet> */}

      <PageBanner text="CONTACT US" />

      <section className="px-6 xl:px-0">
        <div className="w-full max-w-[1222px] mt-[60px] mx-auto">
          <div className="relative">
            <img
              src="/images/contactbanner.png"
              alt="contactbanner"
              className="w-full"
            />
            <h2 className="absolute left-[30px] sm:left-[50px] md:left-[70px] lg:left-[85px] bottom-[20px] sm:bottom-[80px] md:bottom-[100px] lg:bottom-[131px] w-56 justify-start text-primaryBlue text-2xl md:text-4xl font-extrabold font-['Montserrat'] leading-[58px] tracking-tight">
              Contact Us
            </h2>
          </div>

          <div className="lg:-translate-y-20 w-full max-w-[1063px] my-10 lg:my-0 mx-auto flex flex-wrap justify-center lg:flex-nowrap gap-[50px]">
            <div
              style={{
                backgroundImage: "url(/images/whiteBg.svg)",
                backgroundRepeat: "no-repeat",
              }}
              className="w-full max-w-[480px] h-[320px] lg:h-[310px] flex flex-col justify-center items-center"
            >
              <span>
                <Phone size={50} />
              </span>
              <p className=" mt-3 mb-6 justify-start text-center text-primaryBlue text-lg md:text-xl lg:text-2xl font-bold font-['Montserrat'] leading-normal tracking-tight">
                +234 (1) 2716892, <br />
                +234 (1) 2718630
              </p>
              <span>
                <Mail size={50} />
              </span>
              <p className=" mt-2.5 justify-start text-primaryBlue text-lg md:text-xl lg:text-2xl font-bold font-['Montserrat'] leading-normal tracking-tight">
                info@pacresearch.org
              </p>
            </div>
            <div
              style={{
                backgroundImage: "url(/images/whiteBg.svg)",
                backgroundRepeat: "no-repeat",
              }}
              className="w-full max-w-[480px] h-[310px] flex flex-col justify-center items-center"
            >
              <span>
                <MapPin size={50} />
              </span>
              <p className="lg:w-96 h-28 mt-3 px-3 text-center justify-start text-primaryBlue text-base md:text-xl font-bold font-['Montserrat'] leading-normal tracking-tight">
                4th Floor, 999C Danmole Street, Off Idejo Street, Victoria
                Island, Lagos.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-[52px] justify-center flex flex-col md:flex-row gap-5 w-full max-w-max mx-auto">
          <div className="relative h-full">
            <img src="/images/woman.png" alt="woman" className="h-full" />
            <div className="absolute top-0 left-0 w-full h-full bg-[#15bffd72] rounded-[30px]"></div>
          </div>

          <div
            className="flex flex-col gap-10 justify-between py-10 px-6 md:px-[54px] w-full md:max-w-[50%] rounded-[20px] h-max"
            style={{
              backgroundImage: `url(/images/onlinecontact.png)`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "20% 0%",
            }}
          >
            <p className="max-w-[356px] h-[78px] text-[#f8f8f8] text-lg font-medium  font-['Inter'] leading-relaxed">
              Fill out our online contact form, and our team will respond within
              24 hours.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="w-[100%]  bg-[#D9D5D5] py-8 px-3 md:px-[34px] rounded-[30px] flex flex-col gap-2.5 "
            >
              <div>
                <input
                  type="text"
                  name="name"
                  id="contact-name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={fieldClass("name")}
                  placeholder="Your Name"
                />
                {errorText("name")}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  id="contact-email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={fieldClass("email")}
                  placeholder="Your Email"
                />
                {errorText("email")}
              </div>
              <div>
                <input
                  type="text"
                  name="subject"
                  id="contact-subject"
                  value={form.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={fieldClass("subject")}
                  placeholder="Subject"
                />
                {errorText("subject")}
              </div>
              <div>
                <textarea
                  name="message"
                  id="contact-message"
                  value={form.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`h-[100px] md:h-[200px] ${fieldClass("message")}`}
                  placeholder="Message"
                ></textarea>
                {errorText("message")}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-[14px] w-[120px] h-14 relative rounded-[35px] bg-primaryBlue ${
                  isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <p className="left-[18px] top-[18px] absolute text-white text-base font-normal font-['Sans'] leading-tight tracking-tight">
                  {isSubmitting ? "..." : "Send"}
                </p>
                <div className="w-[42px] h-[42px] left-[71px] top-[7px] absolute">
                  <div className="w-[42px] h-[42px] left-0 top-0 absolute flex justify-center items-center bg-[#fefdff] rounded-full">
                    <span className="text-primaryBlue text-[30px]">
                      <ArrowRight />
                    </span>
                  </div>
                </div>
              </button>

              {status && (
                <p
                  role="status"
                  className={`text-sm font-medium ${
                    status.type === "success" ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {status.text}
                </p>
              )}
            </form>
          </div>
        </div>
        <div className="w-full mb-32">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7311430295235!2d3.411366174643367!3d6.428576193562478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8ad1fcc3a273%3A0xe03d45a196e48c89!2s4th%20Floor%2C%20999c%20Danmole%20St%2C%20Victoria%20Island%2C%20Lagos%20106104%2C%20Lagos!5e0!3m2!1sen!2sng!4v1793105471264!5m2!1sen!2sng"
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </>
  );
};

export default Contact;
