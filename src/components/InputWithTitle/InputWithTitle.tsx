import { P3, Stack, TextArea } from "@deskpro/app-sdk";
import { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  title: string;
  error: boolean;
  required?: boolean;
  register: UseFormRegisterReturn;
  type?: string;
  style?: React.CSSProperties;
}

export const InputWithTitle = ({
  title,
  error,
  required,
  register,
  type,
  style,
  ...attributes
}: Props) => {
  return (
    <Stack vertical style={{ width: "98%", marginTop: "5px" }}>
      <Stack>
        <P3>{title}</P3>
        {required && (
          <Stack style={{ color: "red" }}>
            <P3>⠀*</P3>
          </Stack>
        )}
      </Stack>
      <TextArea
        error={error}
        style={{
          fontFamily: "Noto Sans",
          fontWeight: 500,
          fontSize: "12px",
          resize: "none",
          ...style,
        }}
        placeholder={`Enter ${type === "number" ? "number" : "value"}`}
        {...register}
        {...attributes}
      />
    </Stack>
  );
};
