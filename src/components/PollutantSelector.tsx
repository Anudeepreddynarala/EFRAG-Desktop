import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const pollutantsData = [
  "Alachlor",
  "Aldrin",
  "Ammonia (NH3)",
  "Anthracene",
  "Arsenic and compounds (As)",
  "Asbestos",
  "Atrazine",
  "Benzene",
  "Benzo(g,h,i)perylene",
  "Brominated diphenylethers (PBDE)",
  "Cadmium and compounds (Cd)",
  "Carbon dioxide (CO2)",
  "Carbon monoxide (CO)",
  "Chlordane",
  "Chlordecone",
  "Chlorfenvinphos",
  "Chlorides (total Cl)",
  "Chlorine and inorganic compounds (HCl)",
  "Chloro-alkanes, C10-C13",
  "Chlorofluorocarbons (CFCs)",
  "Chlorpyrifos",
  "Chromium and compounds (Cr)",
  "Copper and compounds (Cu)",
  "Cyanides (total CN)",
  "DDT",
  "Di-(2-ethyl hexyl) phthalate (DEHP)",
  "1,2-dichloroethane (EDC)",
  "Dichloromethane (DCM)",
  "Dicofol",
  "Dieldrin",
  "Diuron",
  "Endosulphan",
  "Endrin",
  "Ethyl benzene",
  "Ethylene oxide",
  "Fluoranthene",
  "Fluorides (total F)",
  "Fluorine and inorganic compounds (HF)",
  "Halogenated organic compounds (AOX)",
  "Halons",
  "Heptachlor",
  "Hexabromobiphenyl",
  "Hexachlorobenzene (HCB)",
  "Hexachlorobutadiene (HCBD)",
  "1,2,3,4,5,6-hexachlorocyclohexane (HCH)",
  "Hydrochlorofluorocarbons (HCFCs)",
  "Hydro-fluorocarbons (HFCs)",
  "Hydrogen cyanide (HCN)",
  "Isodrin",
  "Isoproturon",
  "Lead and compounds (Pb)",
  "Lindane",
  "Mercury and compounds (Hg)",
  "Methane (CH4)",
  "Mirex",
  "Naphthalene",
  "Nickel and compounds (Ni)",
  "Nitrogen oxides (NOx/NO2)",
  "Nitrous oxide (N2O)",
  "Non-methane volatile organic compounds (NMVOC)",
  "Nonylphenol and Nonylphenol ethoxylates (NP/NPEs)",
  "Octylphenols and Octylphenol ethoxylates",
  "Organotin compounds (total Sn)",
  "Particulate matter (PM)",
  "PCDD + PCDF (dioxins + furans) (Teq)",
  "Pentachlorobenzene",
  "Pentachlorophenol (PCP)",
  "Perfluorocarbons (PFCs)",
  "Perfluorohexane-1-sulfonic acid (PFHxS) and its salts",
  "Perfluorooctanoic acid (PFOA) and its salts",
  "Phenols (total C)",
  "Polychlorinated biphenyls (PCBs)",
  "Polycyclic aromatic hydrocarbons (PAHs)",
  "Simazine",
  "Sulphur hexafluoride (SF6)",
  "Sulphur oxides (SOx/SO2)",
  "Tetrachloroethylene (PER)",
  "Tetrachloromethane (TCM)",
  "1,1,2,2-tetrachloroethane",
  "Toluene",
  "Total nitrogen",
  "Total organic carbon (TOC) (total C or COD/3)",
  "Total phosphorus",
  "Toxaphene",
  "Tributyltin and compounds",
  "Trichlorobenzenes (TCBs) (all isomers)",
  "1,1,1-trichloroethane",
  "Trichloroethylene",
  "Trichloromethane",
  "Trifluralin",
  "Triphenyltin and compounds",
  "Vinyl chloride",
  "Xylenes",
  "Zinc and compounds (Zn)"
];

interface PollutantSelectorProps {
  selectedPollutant?: string;
  onSelect: (pollutant: string) => void;
  disabled?: boolean;
}

export function PollutantSelector({ selectedPollutant, onSelect, disabled }: PollutantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredPollutants = useMemo(() => {
    if (!searchQuery) return pollutantsData;
    
    const query = searchQuery.toLowerCase();
    return pollutantsData.filter(pollutant =>
      pollutant.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (pollutant: string) => {
    onSelect(pollutant);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          {selectedPollutant || "Select pollutant..."}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Pollutant</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Pollutants (Regulation (EU) 2024/1244 of the European Parliament and of the Council of 24 April 2024 on reporting of environmental data from industrial installations, establishing an Industrial Emissions Portal and repealing Regulation (EC) No 166/2006)
          </p>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pollutants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className="space-y-1">
            {filteredPollutants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pollutants found matching your search.
              </div>
            ) : (
              filteredPollutants.map((pollutant) => (
                <div
                  key={pollutant}
                  className={`flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer ${
                    selectedPollutant === pollutant ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleSelect(pollutant)}
                >
                  <span className="text-sm">{pollutant}</span>
                  {selectedPollutant === pollutant && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {selectedPollutant && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Currently selected:</span>
              <Badge variant="secondary">{selectedPollutant}</Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
