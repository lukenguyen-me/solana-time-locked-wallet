import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import { ChevronDownIcon } from "lucide-react";

export function DateTimePicker({
  date,
  onChange,
  placeholder = "Select date",
}: {
  date?: Date;
  placeholder?: string;
  onChange: (value?: Date) => void;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(d) => {
                const newDate = dayjs(d)
                  .set("hour", date?.getHours() || 0)
                  .set("minute", date?.getMinutes() || 0)
                  .set("second", date?.getSeconds() || 0)
                  .toDate();
                onChange(newDate);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          defaultValue="00:00:00"
          value={date ? dayjs(date).format("HH:mm:ss") : ""}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          onChange={(e) => {
            const [hour, minute, second] = e.target.value.split(":");
            const time = dayjs(date)
              .set("hour", Number(hour))
              .set("minute", Number(minute))
              .set("second", Number(second));
            onChange(time.toDate());
          }}
        />
      </div>
    </div>
  );
}
