import {
  DivAsInput,
  Dropdown as DropdownComponent,
  DropdownTargetProps,
  Label,
  H1,
  Stack,
  P3,
  DropdownItemType,
} from "@deskpro/deskpro-ui";
import {
  faCheck,
  faExternalLinkAlt,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";

interface Status {
  key: string;
  value: string;
  label: JSX.Element;
  type: string;
}

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  onChange: (key: string) => void;
  title: string;
  value: string;
  error: boolean;
  labelName: string;
  valueName: string;
  required?: boolean;
};
export const DropdownSelect = ({
  data = [],
  onChange,
  title,
  value,
  error,
  labelName,
  valueName,
  required,
}: Props) => {
  const a = () => {
    document.querySelector(".simplebar-placeholder")?.remove();

    return {
      a: 1,
    };
  };

  const dataOptions = useMemo<DropdownItemType<Status>[]>(() => {
    return data.map((dataInList) => ({
      key: dataInList[labelName],
      label: <Label label={dataInList[labelName]}></Label>,
      value: dataInList[valueName],
      type: "value" as const,
    }));
  }, [data, valueName, labelName]);

  return (
    <Stack vertical style={{ marginTop: "5px", width: "100%" }}>
      <Stack>
        <P3>{title}</P3>
        {required && (
          <Stack style={{ color: "red" }}>
            <H1>⠀*</H1>
          </Stack>
        )}
      </Stack>
      <DropdownComponent<Status, HTMLDivElement>
        placement="bottom-start"
        options={dataOptions}
        fetchMoreText={"Fetch more"}
        autoscrollText={"Autoscroll"}
        selectedIcon={faCheck}
        externalLinkIcon={faExternalLinkAlt}
        onSelectOption={(option) =>
          onChange((option as unknown as { value: string }).value)
        }
      >
        {({ targetProps, targetRef }: DropdownTargetProps<HTMLDivElement>) => (
          <DivAsInput
            {...a()}
            error={error}
            ref={targetRef}
            {...targetProps}
            variant="inline"
            rightIcon={faCaretDown}
            placeholder="Enter value"
            value={value}
          />
        )}
      </DropdownComponent>
    </Stack>
  );
};
