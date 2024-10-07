<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html"/>
    <xsl:param name="country_code"/>

    <xsl:template match="/">
        <name>
            <xsl:apply-templates select="//cca2[text() = $country_code]/../../country_name/common_name"/>
        </name>
        <capital>
            <xsl:apply-templates select="//cca2[text() = $country_code]/../../capital"/>
        </capital>
        <languages>
            <xsl:for-each select="//cca2[text() = $country_code]/../../languages/*">
                <xsl:value-of select="current()"/>
                <xsl:if test="position() != last()">, </xsl:if>
            </xsl:for-each>
        </languages>
        
        <flag>
            <img src="https://www.geonames.org/flags/x/{translate($country_code, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')}.gif"
                 height="20" width="30"/>
        </flag>
        <latitude>
            <xsl:apply-templates select="//cca2[text() = $country_code]/../../coordinates/@lat"/>
        </latitude>
        <longitude>
            <xsl:apply-templates select="//cca2[text() = $country_code]/../../coordinates/@long"/>
        </longitude>
    </xsl:template>
</xsl:stylesheet>
