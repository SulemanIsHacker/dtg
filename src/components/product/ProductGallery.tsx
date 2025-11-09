import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { ProductVideo } from "./ProductVideo";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

function getYouTubeId(url: string) {
  const patterns = [
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
    /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
    /youtube\.com\/embed\/([^"&?\/\s]{11})/,
    /youtu\.be\/([^"&?\/\s]{11})/,
    /youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)([^"&?\/\s]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return '';
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
}

interface GalleryItem {
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
  id: string;
}

interface GalleryItemComponentProps {
  item: GalleryItem;
  productName: string;
  isActive: boolean;
  onClick: () => void;
}

const GalleryItemComponent = ({ item, productName, isActive, onClick }: GalleryItemComponentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (item.type === 'video') {
    const youtubeId = getYouTubeId(item.url);
    const vimeoId = getVimeoId(item.url);
    const isYouTube = youtubeId !== '';
    const isVimeo = vimeoId !== '';
    const isDirectVideo = !isYouTube && !isVimeo;
    
    return (
      <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden shadow-lg">
        {!isPlaying ? (
          <>
            <OptimizedImage
              src={item.thumbnail || (isYouTube ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : (isVimeo ? `https://vumbnail.com/${vimeoId}.jpg` : ''))}
              alt={`${productName} video thumbnail`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsPlaying(true);
                }}
                className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full p-3 transition-all duration-200 hover:scale-110 shadow-lg z-10"
              >
                <Play className="w-6 h-6 ml-0.5" />
              </button>
            </div>
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium z-10">
              VIDEO
            </div>
          </>
        ) : (
          <>
            {isYouTube && (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {isVimeo && (
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&color=ffffff&autopause=0&background=0`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
            {isDirectVideo && (
              <video
                src={item.url}
                className="w-full h-full"
                controls
                autoPlay
              />
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden shadow-lg cursor-pointer" onClick={onClick}>
      <OptimizedImage
        src={item.url}
        alt={`${productName} image`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {isActive && (
        <div className="absolute inset-0 border-2 border-primary rounded-lg"></div>
      )}
    </div>
  );
};

interface ProductGalleryProps {
  product: any;
  images: any[];
  productName: string;
}

export const ProductGallery = ({ product, images, productName }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Combined gallery items (video first, then images)
  const galleryItems = useMemo(() => {
    const items: GalleryItem[] = [];
    
    // Add video first if available
    if (product?.video_url) {
      items.push({
        type: 'video',
        url: product.video_url,
        thumbnail: product.video_thumbnail_url,
        id: 'video'
      });
    }
    
    // Add main image
    if (product?.main_image_url) {
      items.push({
        type: 'image',
        url: product.main_image_url,
        id: 'main-image'
      });
    }
    
    // Add other images
    if (images && images.length > 0) {
      images.forEach((img, index) => {
        if (img.image_url && img.image_url !== product?.main_image_url) {
          items.push({
            type: 'image',
            url: img.image_url,
            id: `image-${index}`
          });
        }
      });
    }
    
    return items;
  }, [product?.video_url, product?.video_thumbnail_url, product?.main_image_url, images]);
  
  // Gallery navigation functions
  const nextImage = useCallback(() => {
    if (galleryItems.length > 1) {
      const nextIndex = (currentImageIndex + 1) % galleryItems.length;
      setCurrentImageIndex(nextIndex);
      setActiveImage(galleryItems[nextIndex]);
    }
  }, [galleryItems, currentImageIndex]);

  const prevImage = useCallback(() => {
    if (galleryItems.length > 1) {
      const prevIndex = currentImageIndex === 0 ? galleryItems.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setActiveImage(galleryItems[prevIndex]);
    }
  }, [galleryItems, currentImageIndex]);

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const selectImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setActiveImage(galleryItems[index]);
  }, [galleryItems]);

  const openGallery = useCallback(() => {
    setIsGalleryOpen(true);
  }, []);

  // Touch handling for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  }, [touchStart, touchEnd, nextImage, prevImage]);

  // Initialize active image
  useState(() => {
    if (galleryItems.length > 0 && !activeImage) {
      setActiveImage(galleryItems[0]);
    }
  });

  if (!product) return null;

  return (
    <>
      {/* Main Gallery Display */}
      <div className="space-y-4">
        {/* Main Image/Video Display */}
        <div className="relative">
          {activeImage?.type === 'video' ? (
            <ProductVideo
              videoUrl={activeImage.url}
              thumbnailUrl={activeImage.thumbnail}
              productName={productName}
            />
          ) : (
            <div 
              className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden shadow-lg cursor-pointer"
              onClick={openGallery}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <OptimizedImage
                src={activeImage?.url || product.main_image_url}
                alt={productName}
                className="w-full h-full object-cover"
                loading="eager"
                priority={true}
                onClick={openGallery}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              {galleryItems.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {currentImageIndex + 1} / {galleryItems.length}
                </div>
              )}
            </div>
          )}
          
          {/* Navigation arrows for main display */}
          {galleryItems.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Grid */}
        {galleryItems.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {galleryItems.map((item, index) => (
              <GalleryItemComponent
                key={item.id}
                item={item}
                productName={productName}
                isActive={index === currentImageIndex}
                onClick={() => selectImage(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div 
              className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {activeImage?.type === 'video' ? (
                <ProductVideo
                  videoUrl={activeImage.url}
                  thumbnailUrl={activeImage.thumbnail}
                  productName={productName}
                />
              ) : (
                <OptimizedImage
                  src={activeImage?.url || product.main_image_url}
                  alt={productName}
                  className="w-full h-full object-contain"
                  loading="eager"
                  priority={true}
                />
              )}
            </div>
            
            {/* Navigation arrows for modal */}
            {galleryItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Thumbnail strip for modal */}
            <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer ${
                    index === currentImageIndex ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => selectImage(index)}
                >
                  <GalleryItemComponent
                    item={item}
                    productName={productName}
                    isActive={index === currentImageIndex}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
