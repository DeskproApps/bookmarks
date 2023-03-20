import {
  HorizontalDivider as HorizontalDividerSDK,
  useDeskproAppTheme,
} from "@deskpro/app-sdk";

export const HorizontalDivider = ({
  style,
}: {
  style?: React.CSSProperties;
}) => {
  const { theme } = useDeskproAppTheme();
  return (
    <HorizontalDividerSDK
      style={{
        width: "110vw",
        backgroundColor: theme?.colors.grey10,
        marginBottom: "10px",
        ...style,
      }}
    />
  );
};
