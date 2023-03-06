/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  DivAsInput,
  Dropdown as DropdownComponent,
  DropdownTargetProps,
  Label,
  H1,
  Stack,
  P3,
} from "@deskpro/app-sdk";
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
  data,
  onChange,
  title,
  value,
  error,
  labelName,
  valueName,
  required,
}: Props) => {
  // This works fine but the types are completely wrong
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataOptions = useMemo<any>(() => {
    return data?.map((dataInList) => ({
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
        // @ts-ignore
        onSelectOption={(option) => onChange(option.value)}
      >
        {({ targetProps, targetRef }: DropdownTargetProps<HTMLDivElement>) => (
          <DivAsInput
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
