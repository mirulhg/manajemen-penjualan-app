import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

type ProductNameLinkProps = {
  productId: string;
  name: string;
  isArchived: boolean;
};

export function ProductNameLink({ productId, name, isArchived }: ProductNameLinkProps) {
  return (
    <Button asChild variant="outline"><Link to={`/stok/${productId}`}>
      {name}
      {isArchived && <span className="ml-2 font-normal text-muted-foreground no-underline">(Diarsipkan)</span>}
    </Link></Button>
  );
}
