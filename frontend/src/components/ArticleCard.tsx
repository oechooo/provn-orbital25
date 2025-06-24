import { Link } from 'react-router-dom';

type ArticleCardProps = {
  id: number;
  title: string;
  source: string;
  excerpt: string;
  confidence: number;
  date: string;
  imageUrl?: string;
};

const ArticleCard = ({ id, title, source, excerpt, confidence, date, imageUrl }: ArticleCardProps) => {
  // Function to determine confidence level and appropriate styling
  const getConfidenceDisplay = () => {
    if (confidence >= 80) {
      return <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30 backdrop-blur-sm">High Confidence</span>;
    } else if (confidence >= 50) {
      return <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30 backdrop-blur-sm">Medium Confidence</span>;
    } else {
      return <span className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30 backdrop-blur-sm">Low Confidence</span>;
    }
  };

  return (
    <div className="glass-card group h-full flex flex-col hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">      {imageUrl && (
        <div className="overflow-hidden h-40 rounded-t-2xl relative">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className="text-purple-300 text-sm font-semibold bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">{source}</span>
          <span className="text-slate-400 text-xs">{date}</span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3 flex-grow line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 transition-all duration-300">{title}</h3>
        
        <p className="text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          {getConfidenceDisplay()}
          <Link 
            to={`/article/${id}`} 
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-cyan-500/25"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;