<?xml version="1.0" encoding="UTF-8"?>

<!-- New XSLT document created with EditiX XML Editor (http://www.editix.com) at Tue Mar 07 20:52:15 CET 2023 -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html"/>

    <xsl:template match="/">
        <html>
            <head>
                <title>
                    Countries of the world
                </title>
            </head>

            <body style="background-color:white;">
                <h1>Information about the countries</h1>

                <xsl:apply-templates select="//metadonnees"/>

                Mise en forme par : GIRAUDON Clément, MAILLARD Swan (B3423)
                <hr/>
                <hr/>

                <p>
                    Countries where more than 2 langauges are spoken:
                </p>

                <ul>
                    <xsl:for-each select="//country[count(languages/*)>2]/country_name/common_name">
                        <li>
                            <xsl:value-of select="current()"/>
                            :
                            <xsl:for-each select="../../languages/*">
                                <xsl:value-of select="current()"/>
                                (<xsl:value-of select="name()"/>)
                                <xsl:if test="position() != last()">, </xsl:if>
                            </xsl:for-each>
                        </li>
                    </xsl:for-each>
                </ul>

                <xsl:for-each select="//country">
                    <xsl:sort select="count(borders/neighbour)" data-type="number" order="descending"/>
                    <xsl:if test="position()=1">
                        Countries having the most neighbours: <xsl:value-of select="country_name/common_name"/>,
                        nb de voisins : <xsl:value-of select="count(borders/neighbour)"/>
                    </xsl:if>
                </xsl:for-each>

                <xsl:for-each select="//continent[not(preceding::continent/. = .) and text() != '']">
                    <xsl:variable name="continent" select="current()"/>
                    <h3>Pays du continent :
                        <xsl:value-of select="$continent"/> par sous-régions :
                    </h3>

                    <xsl:for-each
                            select="//infosContinent[continent = $continent]/subregion[not(preceding::subregion/. = .)]">
                        <xsl:variable name="subregion" select="current()"/>
                        <h4>
                            <xsl:value-of select="current()"/> (<xsl:value-of
                                select="count(//country[infosContinent/continent = $continent and infosContinent/subregion = $subregion])"/>
                            pays)
                        </h4>

                        <table border="3" width="100%" align="center">
                            <tr>
                                <th>N°</th>
                                <th>Name</th>
                                <th>Capital</th>
                                <th>Coordinates</th>
                                <th>Neighbors</th>
                                <th>Flag</th>
                                <th>Spoken languages</th>
                            </tr>
                            <xsl:apply-templates
                                    select="//country[infosContinent/continent = $continent and infosContinent/subregion = $subregion]"/>
                        </table>

                    </xsl:for-each>

                </xsl:for-each>

            </body>
        </html>
    </xsl:template>

    <xsl:template match="metadonnees">
        <p style="text-align:center; color:green;">
            Objectif :
            <xsl:value-of select="objectif"/>
        </p>
    </xsl:template>

    <xsl:template match="country">
        <tr>
            <td>
                <xsl:value-of select="position()"/>
            </td>
            <td>
                <span style="color:green">
                    <xsl:value-of select="country_name/offic_name"/>
                </span>
                (<xsl:value-of select="country_name/common_name"/>)
                <xsl:if test="count(country_name/native_name[@lang = 'fra']) = 1">
                    <br/>
                    <span style="color:blue">
                        Nom français :
                        <xsl:value-of select="country_name/native_name[@lang = 'fra']/offic_name"/>
                    </span>
                </xsl:if>
            </td>
            <td>
                <xsl:value-of select="capital"/>
            </td>
            <td>
                Latitude :
                <xsl:value-of select="coordinates/@lat"/>
                <br/>
                Longitude :
                <xsl:value-of select="coordinates/@long"/>
            </td>
            <td>
                <xsl:choose>
                    <xsl:when test="count(borders) = 0 and landlocked/text() = 'false'">
                        Île
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:apply-templates select="borders/neighbour"/>
                    </xsl:otherwise>
                </xsl:choose>

            </td>
            <td>

                <img src="https://www.geonames.org/flags/x/{translate(country_codes/cca2, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')}.gif"
                     height="40" width="60"/>
            </td>
            <td>
                <xsl:for-each select="languages/*">
                    <xsl:value-of select="current()"/>
                    <xsl:if test="position() != last()">,</xsl:if>
                </xsl:for-each>
            </td>
        </tr>
    </xsl:template>

    <xsl:template match="neighbour">
        <xsl:variable name="code">
            <xsl:value-of select="text()"/>
        </xsl:variable>

        <xsl:if test="count(//country[country_codes/cca3 = $code]) > 0">
            <xsl:value-of select="//country[country_codes/cca3 = $code]/country_name/offic_name"/>
            <xsl:if test="position() != last()">,</xsl:if>
        </xsl:if>

    </xsl:template>

</xsl:stylesheet>


