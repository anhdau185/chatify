import CarouselSlider from '@components/CarouselSlider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';

export default function EmptyChatScreen() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <CarouselSlider>
        <Card className="w-full max-w-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center font-bold">
              Quick Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span>One high-value quick setting here</span>
          </CardContent>
          <CardFooter>
            <CardDescription className="w-full text-center text-xs">
              Some footer info
            </CardDescription>
          </CardFooter>
        </Card>

        <Card className="w-full max-w-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center font-bold">
              Start Chatting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span>List of contacts here</span>
          </CardContent>
          <CardFooter>
            <CardDescription className="w-full text-center text-xs">
              Some footer info
            </CardDescription>
          </CardFooter>
        </Card>
      </CarouselSlider>
    </div>
  );
}
