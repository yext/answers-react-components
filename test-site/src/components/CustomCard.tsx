
import { CardProps } from '@yext/search-ui-react';

interface CustomRawDataType {
  name: string,
  description: string,
}

export function CustomCard(props: CardProps<CustomRawDataType>): JSX.Element {
  const { result } = props;

  return (
    <div className='flex flex-col justify-between border rounded-lg mb-4 p-4 shadow-sm'>
        <p className='text-red-600'>Custom Card</p>
        <p>Name: {result.rawData.name}</p>
        <p>Description: {result.rawData.description}</p>
    </div>
  );
}
