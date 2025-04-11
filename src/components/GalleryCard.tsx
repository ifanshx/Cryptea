import { Item } from "";

interface GalleryCardProps {
  items: Item[];
  selectedItem: Item | null;
  onSelectItem: (item: Item) => void;
}

const GalleryCard = ({ items, selectedItem, onSelectItem }: GalleryCardProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.edition}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelectItem(item)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && onSelectItem(item)}
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-contain mb-4"
            loading="lazy"
          />
          <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
          
          {/* Badge atribut */}
          <div className="mt-3 flex flex-wrap gap-2">
            {item.attributes.map((attr) => (
              <span 
                key={`${attr.trait_type}-${attr.value}`}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {attr.value}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryCard;