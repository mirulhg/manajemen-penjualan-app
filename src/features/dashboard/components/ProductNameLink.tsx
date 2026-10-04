import { Link } from 'react-router';

type ProductNameLinkProps = {
  productId: string;
  name: string;
  isArchived: boolean;
};

export function ProductNameLink({ productId, name, isArchived }: ProductNameLinkProps) {
  return (
    <Link to={`/stok/${productId}`} className="inline-flex min-h-11 items-center font-medium text-primary underline">
      {name}
      {isArchived && <span className="ml-2 font-normal text-text-muted no-underline">(Diarsipkan)</span>}
    </Link>
  );
}
