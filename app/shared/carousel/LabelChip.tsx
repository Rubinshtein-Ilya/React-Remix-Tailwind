import StatusChip from "~/shared/carousel/StatusChip";
import { useItemLabels } from "~/queries/public";
import { Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";

function LabelChip({ labelId }: { labelId: string }) {
  const { data, isPending } = useItemLabels();

  const getLabelTranslation = () => {
    if (!data || isPending) return {
      name: labelId,
      tooltip: undefined
    };

    const label =  data.find(l => l._id === labelId);

    if (!label) return {
      name: labelId,
      tooltip: undefined
    };

    return {
      name: label.name.ru,
      tooltip: label.description.ru,
    };
  }

  const {
    name,
    tooltip,
  } = getLabelTranslation();

  return (
    <Tooltip>
      <TooltipTrigger>
        <StatusChip title={name} />
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default LabelChip;
