import {
  HorizontalDivider as HorizontalDividerSDK,
  useDeskproAppTheme,
} from "@deskpro/app-sdk";

export const HorizontalDivider = () => {
  const { theme } = useDeskproAppTheme();
  return (
    <HorizontalDividerSDK
      style={{
        width: "100vw",
        color: theme?.colors.grey10,
        marginBottom: "10px",
      }}
    />
  );
};
