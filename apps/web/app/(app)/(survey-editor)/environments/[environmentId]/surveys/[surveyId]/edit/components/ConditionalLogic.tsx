import { AdvancedLogicEditor } from "@/app/(app)/(survey-editor)/environments/[environmentId]/surveys/[surveyId]/edit/components/AdvancedLogicEditor";
import { createId } from "@paralleldrive/cuid2";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CopyIcon,
  MoreVerticalIcon,
  SplitIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo } from "react";
import { duplicateLogicItem } from "@formbricks/lib/survey/logic/utils";
import { replaceHeadlineRecall } from "@formbricks/lib/utils/recall";
import { TAttributeClass } from "@formbricks/types/attribute-classes";
import { TSurveyAdvancedLogic } from "@formbricks/types/surveys/logic";
import { TSurvey, TSurveyQuestion } from "@formbricks/types/surveys/types";
import { Button } from "@formbricks/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@formbricks/ui/DropdownMenu";
import { Label } from "@formbricks/ui/Label";

interface ConditionalLogicProps {
  localSurvey: TSurvey;
  questionIdx: number;
  question: TSurveyQuestion;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  attributeClasses: TAttributeClass[];
}

export function ConditionalLogic({
  attributeClasses,
  localSurvey,
  question,
  questionIdx,
  updateQuestion,
}: ConditionalLogicProps) {
  const transformedSurvey = useMemo(() => {
    return replaceHeadlineRecall(localSurvey, "default", attributeClasses);
  }, [localSurvey, attributeClasses]);

  const addLogic = () => {
    const initialCondition: TSurveyAdvancedLogic = {
      id: createId(),
      conditions: {
        id: createId(),
        connector: "and",
        conditions: [
          {
            id: createId(),
            leftOperand: {
              type: "question",
              id: localSurvey.questions[questionIdx].id,
            },
            operator: "isSkipped",
          },
        ],
      },
      actions: [
        {
          id: createId(),
          objective: "jumpToQuestion",
          target: "",
        },
      ],
    };

    updateQuestion(questionIdx, {
      logic: [...(question?.logic || []), initialCondition],
    });
  };

  const handleDeleteLogic = (logicItemIdx: number) => {
    const logicCopy = structuredClone(question.logic || []);
    logicCopy.splice(logicItemIdx, 1);
    updateQuestion(questionIdx, {
      logic: logicCopy,
    });
  };

  const moveLogic = (from: number, to: number) => {
    const logicCopy = structuredClone(question.logic || []);
    const [movedItem] = logicCopy.splice(from, 1);
    logicCopy.splice(to, 0, movedItem);
    updateQuestion(questionIdx, {
      logic: logicCopy,
    });
  };

  const duplicateLogic = (logicItemIdx: number) => {
    const logicCopy = structuredClone(question.logic || []);
    const lc = logicCopy[logicItemIdx];
    console.log(lc);
    const newLogicItem = duplicateLogicItem(lc);
    logicCopy.splice(logicItemIdx + 1, 0, newLogicItem);

    updateQuestion(questionIdx, {
      logic: logicCopy,
    });
  };

  return (
    <div className="mt-10">
      <Label className="flex gap-2">
        Conditional Logic
        <SplitIcon className="h-4 w-4 rotate-90" />
      </Label>

      {question.logic && question.logic?.length > 0 && (
        <div className="logic-scrollbar mt-2 flex w-full flex-col gap-4">
          {question.logic.map((logicItem, logicItemIdx) => (
            <div
              key={logicItem.id}
              className="flex w-full grow items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <AdvancedLogicEditor
                localSurvey={transformedSurvey}
                logicItem={logicItem}
                updateQuestion={updateQuestion}
                question={question}
                questionIdx={questionIdx}
                logicIdx={logicItemIdx}
              />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVerticalIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      duplicateLogic(logicItemIdx);
                    }}>
                    <CopyIcon className="h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={logicItemIdx === 0}
                    onClick={() => {
                      moveLogic(logicItemIdx, logicItemIdx - 1);
                    }}>
                    <ArrowUpIcon className="h-4 w-4" />
                    Move up
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={logicItemIdx === (question.logic?.length || 1) - 1}
                    onClick={() => {
                      moveLogic(logicItemIdx, logicItemIdx + 1);
                    }}>
                    <ArrowDownIcon className="h-4 w-4" />
                    Move down
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      handleDeleteLogic(logicItemIdx);
                    }}>
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center space-x-2 py-1 text-sm">
        <ArrowRightIcon className="h-4 w-4" />
        <p className="text-slate-700">All other answers will continue to the next question</p>
      </div>

      <div className="mt-2 flex items-center space-x-2">
        <Button
          id="logicJumps"
          className="bg-slate-100 hover:bg-slate-50"
          type="button"
          name="logicJumps"
          size="sm"
          variant="secondary"
          StartIcon={SplitIcon}
          startIconClassName="rotate-90"
          onClick={() => addLogic()}>
          Add Logic
        </Button>
      </div>
    </div>
  );
}
