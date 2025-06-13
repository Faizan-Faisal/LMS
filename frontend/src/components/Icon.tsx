import React from 'react';
import { IconType } from 'react-icons';
import type { IconBaseProps } from 'react-icons';

interface IconProps {
    icon: IconType;
    className?: string;
}

const Icon: React.FC<IconProps> = ({ icon: IconComponent, className }) => {
    // Cast IconComponent to any to bypass TypeScript's strict type checking
    const Component = IconComponent as any;
    return <Component className={className} />;
};

export default Icon; 