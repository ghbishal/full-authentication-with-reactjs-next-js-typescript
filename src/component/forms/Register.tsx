import * as React from "react";
import Input from "@/component/inputs/Input";
import { CiUser } from "react-icons/ci";
import { FiLock, FiMail } from "react-icons/fi";
import { BsTelephone } from "react-icons/bs";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import validator from "validator";
import zxcvbn from "zxcvbn";
import { useEffect } from "react";
import SlideButton from "../button/SlideButton";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";

const FormSchema = z
  .object({
    first_name: z
      .string()
      .min(2, "First name must be atleast 2 characters")
      .max(32, "First name must be less than 32 characters")
      .regex(new RegExp("[a-zA-Z]+$"), "No special characters allowed"),
    last_name: z
      .string()
      .min(2, "Last name must be atleast 2 characters")
      .max(32, "Last name must be less than 32 characters")
      .regex(new RegExp("[a-zA-Z]+$"), "No special characters allowed"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().refine(validator.isMobilePhone, {
      message: "Please enter a valid phone number",
    }),
    password: z
      .string()
      .min(6, "Password must be atleast 6 characters.")
      .max(52, "Password must be less than 52 characters."),
    confirmPassword: z.string(),
    // validation for check box
    accept: z.literal(true, {
      errorMap: () => ({
        message:
          "Please agree to all the terms and conditions before continuing",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password doesn't match",
    path: ["confirmPassword"],
  });

type FormSchemaType = z.infer<typeof FormSchema>;

export default function Register() {
  const [passwordScore, setPasswordScore] = React.useState(0);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (values) => {
    try {
      const { data } = await axios.post("api/auth/signup", {
        ...values,
      });
      reset();
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  const validatePasswordStrength = () => {
    let password = watch().password;
    return zxcvbn(password ? password : "").score;
  };

  useEffect(() => {
    setPasswordScore(validatePasswordStrength());
  }, [watch().password]);

  return (
    <div className="w-full px-12 py-4">
      <h2 className="text-center text-2xl font-bold tracking-wide text-gray-800">
        Sign up
      </h2>
      <p className="text-center text-sm text-gray-600 mt-2">
        You alredy have an account ?&nbsp;
        <Link
          href="/auth"
          className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          Sign in
        </Link>
      </p>

      <form className="my-8 text-sm" onSubmit={handleSubmit(onSubmit)}>
        <div className="gap-2 md:flex">
          <Input
            name="first_name"
            label="First name"
            type="text"
            icon={<CiUser />}
            placeholder="example"
            register={register}
            error={errors?.first_name?.message}
            disabled={isSubmitting}
          />
          <Input
            name="last_name"
            label="Last name"
            type="text"
            icon={<CiUser />}
            placeholder="example"
            register={register}
            error={errors?.last_name?.message}
            disabled={isSubmitting}
          />
        </div>
        <Input
          name="email"
          label="Email"
          type="text"
          icon={<FiMail />}
          placeholder="example@bishal.com"
          register={register}
          error={errors?.email?.message}
          disabled={isSubmitting}
        />
        <Input
          name="phone"
          label="Phone number"
          type="text"
          icon={<BsTelephone />}
          placeholder="+(XXX) XXX-XXXX-XXXX"
          register={register}
          error={errors?.phone?.message}
          disabled={isSubmitting}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          icon={<FiLock />}
          placeholder="***************"
          register={register}
          error={errors?.password?.message}
          disabled={isSubmitting}
        />
        {watch().password?.length > 0 && (
          <div className="flex mt-2">
            {Array.from(Array(5).keys()).map((span, i) => (
              <span className="w-1/5 px-1" key={i}>
                <div
                  className={`h-2 rounded-xl b ${
                    passwordScore <= 2
                      ? "bg-red-400"
                      : passwordScore < 4
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                ></div>
              </span>
            ))}
          </div>
        )}
        <Input
          name="confirmPassword"
          label="Confirm password"
          type="password"
          icon={<FiLock />}
          placeholder="***************"
          register={register}
          error={errors?.confirmPassword?.message}
          disabled={isSubmitting}
        />
        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            id="accept"
            className="mr-2 focus:right-0 rounded"
            {...register("accept")}
          />
          <label htmlFor="accept" className="text-gray-700">
            I accept the&nbsp;{" "}
            <a
              href=""
              className="text-blue-600 hover:text-blue-700 hover:underline"
              target="_blank"
            >
              trems
            </a>
            &nbsp;and&nbsp;
            <a
              href=""
              className="text-blue-600 hover:text-blue-700 hover:underline"
              target="_blank"
            >
              privacy policy
            </a>
          </label>
        </div>
        {errors?.accept && (
          <p className="text-sm text-red-600 mt-1">{errors?.accept?.message}</p>
        )}
        <SlideButton
          type="submit"
          text="Sign up"
          slide_text="Secure sign up"
          icon={<FiLock />}
          disabled={isSubmitting}
        />
      </form>
    </div>
  );
}
